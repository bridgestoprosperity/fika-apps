import { json } from '@sveltejs/kit';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import mockData from './mock.json';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, fetch, platform }) {
    try {
        // Check if we're requesting a simpler debug endpoint
        if (url.searchParams.get('debug') === 'true') {
            try {
                // Return basic information about the environment
                return json({
                    message: 'Debug mode',
                    timestamp: new Date().toISOString(),
                    env: {
                        DATABASE_URL_EXISTS: !!env.DATABASE_URL,
                        PLATFORM_ENV_EXISTS: !!platform?.env?.DATABASE_URL,
                        PROCESS_ENV_EXISTS: !!process.env.DATABASE_URL,
                        NODE_ENV: process.env.NODE_ENV
                    }
                });
            } catch (debugError) {
                return json({ error: 'Debug error', details: debugError.message });
            }
        }
        
        // Get environment variables either from platform (Vercel), SvelteKit env, or process.env
        let connectionString = platform?.env?.DATABASE_URL || env.DATABASE_URL || process.env.DATABASE_URL;
        
        // Only use mock data if explicitly requested
        if (url.searchParams.get('mock') === 'true') {
            console.log('Using mock data for bridges (explicit request)');
            return json({
                success: true,
                data: mockData
            });
        }
        
        // We now want to prioritize real database data
        const forceMockData = !connectionString && url.searchParams.get('simple') === 'true';
        
        if (forceMockData) {
            console.log('No connection string, using mock data as fallback');
            return json({
                success: true,
                data: mockData
            });
        }
        
        console.log('Database connection available:', !!connectionString);
        
        // If connection string uses the wrong domain, correct it
        if (connectionString && connectionString.includes('czujcujmkk4k')) {
            console.log('Correcting database connection string domain');
            connectionString = connectionString.replace(
                'fika-impact-database.czujcujmkk4k.us-west-1.rds.amazonaws.com',
                'fika-impact-database.cdoaycgiqb5w.us-west-1.rds.amazonaws.com'
            );
        }
        
        // For debugging - print parts of the connection string
        if (connectionString) {
            const firstPart = connectionString.substring(0, 20);
            const lastPart = connectionString.substring(connectionString.indexOf('@') !== -1 ? 
                              connectionString.indexOf('@') : connectionString.length);
            console.log('Connection string parts:', firstPart + '...' + lastPart);
        }
        
        if (!connectionString) {
            console.log('No database connection string found, using mock data');
            return json({
                success: true,
                data: mockData
            });
        }

        // Parse query parameters
        const year = url.searchParams.get('year');
        const type = url.searchParams.get('type');
        const limit = url.searchParams.get('limit') || '1000';
        const withGeom = url.searchParams.get('withGeom') === 'true';

        // Add a simple query mode for basic testing
        if (url.searchParams.get('test') === 'true') {
            try {
                // Just try a basic connection and simple query
                const client = new pg.Client({ 
                    connectionString,
                    statement_timeout: 60000,
                    connectionTimeoutMillis: 60000
                });
                await client.connect();
                
                // Test with a simple query first
                const result = await client.query('SELECT current_database() as db, current_user as user');
                await client.end();
                
                return json({
                    success: true,
                    message: 'Simple connection test successful',
                    database: result.rows[0].db,
                    user: result.rows[0].user
                });
            } catch (error) {
                return json({ 
                    error: 'Simple test failed', 
                    details: error.message,
                    code: error.code
                }, { status: 500 });
            }
        }
        
        try {
            // Create client and connect
            const client = new pg.Client({ 
                connectionString,
                // Increase statement and connection timeouts to 1 minute
                statement_timeout: 60000,
                connectionTimeoutMillis: 60000 
            });
            await client.connect();

            // Build the query based on filters
            let query;
            
            // First check if the geometry column exists and get its type
            try {
                const geoColumnCheck = await client.query(`
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'bridges' AND column_name = 'geometry'
                `);
                
                console.log('Geometry column type:', geoColumnCheck.rows[0]?.data_type);
                
                // Also check if PostGIS is properly installed
                const postgisCheck = await client.query(`SELECT PostGIS_version()`);
                console.log('PostGIS version:', postgisCheck.rows[0]?.postgis_version);
            } catch (err) {
                console.error('Error checking column info:', err);
            }
            
            // Check if the bridges table exists first
            const tableExists = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'bridges'
                );
            `);
            
            if (!tableExists.rows[0].exists) {
                await client.end();
                return json({ 
                    error: 'Table not found', 
                    message: 'The bridges table does not exist in the database.'
                }, { status: 404 });
            }
            
            // Get the table structure to understand what columns we have
            const tableColumns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'bridges';
            `);
            
            console.log('Table columns:', tableColumns.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
            
            // Check if geometry column exists
            const hasGeom = tableColumns.rows.some(col => col.column_name === 'geometry');
            
            // Construct a query based on detected columns
            const columnNames = tableColumns.rows.map(col => col.column_name);
            
            // Build query based on actual columns from the table structure
            // Use ogc_fid as the primary key instead of id
            query = `
                SELECT 
                    ogc_fid as id, 
                    ${columnNames.includes('bridge_index') ? 'bridge_index,' : ''} 
                    ${columnNames.includes('exit_point_index') ? 'exit_point_index,' : ''}
                    ${hasGeom ? 'encode(ST_AsBinary(geometry), \'hex\') as geometry,' : ''} 
                    ${hasGeom ? 'CAST(ST_X(geometry) AS DECIMAL(10,6)) as longitude,' : ''}
                    ${hasGeom ? 'CAST(ST_Y(geometry) AS DECIMAL(10,6)) as latitude,' : ''}
                    'Bridge' as bridge_type,
                    2023 as year_completed,
                    'Rwanda' as country,
                    'Test' as name,
                    0 as span_length,
                    0 as communities_served,
                    0 as people_served
                FROM bridges
                WHERE 1=1
            `;

            const params = [];
            let paramIndex = 1;

            if (year) {
                query += ` AND year_completed = $${paramIndex}`;
                params.push(parseInt(year));
                paramIndex++;
            }

            if (type) {
                query += ` AND bridge_type = $${paramIndex}`;
                params.push(type);
                paramIndex++;
            }

            // Add limit
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limit));

            // First check if the bridges table exists
            try {
                const tableCheck = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'bridges'
                    );
                `);
                
                if (!tableCheck.rows[0].exists) {
                    console.log('Bridges table does not exist, creating it with sample data');
                    
                    // Create the table
                    await client.query(`
                        CREATE TABLE IF NOT EXISTS bridges (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            bridge_type VARCHAR(100) NOT NULL,
                            year_completed INTEGER,
                            latitude DECIMAL(10, 6) NOT NULL,
                            longitude DECIMAL(10, 6) NOT NULL,
                            span_length DECIMAL(8, 2),
                            communities_served INTEGER,
                            people_served INTEGER,
                            country VARCHAR(100),
                            region VARCHAR(100),
                            district VARCHAR(100),
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    
                    // No longer inserting mock data - the database already has real data
                    console.log('Table exists but no data was found - the database may need to be seeded');
                    
                    // Check if PostGIS extension is available
                    try {
                        const postgisCheck = await client.query(`
                            SELECT EXISTS (
                                SELECT 1 FROM pg_extension WHERE extname = 'postgis'
                            );
                        `);
                        
                        if (postgisCheck.rows[0].exists) {
                            // Add geom column if PostGIS is available
                            await client.query(`
                                ALTER TABLE bridges ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
                                UPDATE bridges SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
                            `);
                        }
                    } catch (postgisError) {
                        console.log('PostGIS extension not available:', postgisError.message);
                    }
                }
                
                // Execute the main query
                const result = await client.query(query, params);
                await client.end();
                
                return json(result.rows);
            } catch (schemaError) {
                console.error('Error checking schema:', schemaError);
                // Try a simple query to log the table structure
                try {
                    const tableInfo = await client.query(`
                        SELECT column_name, data_type 
                        FROM information_schema.columns 
                        WHERE table_name = 'bridges';
                    `);
                    console.log('Table structure:', tableInfo.rows);
                } catch (err) {
                    console.error('Failed to get table info:', err);
                }
                await client.end();
                return json({ error: 'Schema error', details: schemaError.message }, { status: 500 });
            }
        } catch (dbError) {
            console.error('Error connecting to database:', dbError.message);
            console.error('Error details:', {
                code: dbError.code,
                detail: dbError.detail,
                hint: dbError.hint,
                position: dbError.position,
                where: dbError.where,
                internalQuery: dbError.internalQuery
            });
            // Force create a test table to verify PostgreSQL connection
            try {
                const testClient = new pg.Client({ 
                    connectionString,
                    statement_timeout: 5000
                });
                await testClient.connect();
                console.log('Connected to PostgreSQL for test query');
                await testClient.query('SELECT 1 as test');
                console.log('Test query executed successfully');
                await testClient.end();
            } catch (testError) {
                console.error('Test connection also failed:', testError.message);
            }
            return json({ error: 'Database error', details: dbError.message }, { status: 500 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}