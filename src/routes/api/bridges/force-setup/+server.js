import { json } from '@sveltejs/kit';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import mockData from '../mock.json';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    try {
        // Get environment variables from all possible sources
        let connectionString = env.DATABASE_URL || process.env.DATABASE_URL;
        
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
            const lastPart = connectionString.substring(connectionString.indexOf('@'));
            console.log('Connection string parts:', firstPart + '...' + lastPart);
        }
        
        if (!connectionString) {
            return json({ success: false, error: 'No connection string found' });
        }
        
        // Attempt to connect
        const client = new pg.Client({ 
            connectionString,
            // Increased timeout to 1 minute
            statement_timeout: 60000,
            // Connection timeout also increased
            connectionTimeoutMillis: 60000
        });
        
        await client.connect();
        console.log('Connected to PostgreSQL for forced setup');
        
        // Step 1: Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'bridges'
            );
        `);
        
        let message = 'Checking setup: ';
        let created = false;
        
        // Step 2: Create table if needed
        if (!tableCheck.rows[0].exists) {
            message += 'Table does not exist, creating... ';
            
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
            created = true;
            message += 'Table created. ';
            
            // Insert sample data
            message += 'Inserting sample data... ';
            for (const bridge of mockData) {
                await client.query(`
                    INSERT INTO bridges (
                        name, bridge_type, year_completed, 
                        latitude, longitude, span_length,
                        communities_served, people_served,
                        country, region, district
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [
                    bridge.name, 
                    bridge.bridge_type, 
                    bridge.year_completed,
                    bridge.latitude, 
                    bridge.longitude, 
                    bridge.span_length,
                    bridge.communities_served || 0,
                    bridge.people_served || 0,
                    bridge.country || 'Rwanda',
                    bridge.region || 'Unknown',
                    bridge.district || 'Unknown'
                ]);
            }
            message += 'Data inserted. ';
        } else {
            message += 'Table already exists. ';
        }
        
        // Step 3: Check for PostGIS
        try {
            const postgisCheck = await client.query(`
                SELECT EXISTS (
                    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
                );
            `);
            
            if (postgisCheck.rows[0].exists) {
                message += 'PostGIS is available. ';
                
                // Check if geometry column exists
                const geomCheck = await client.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'bridges' AND column_name = 'geometry'
                    );
                `);
                
                if (!geomCheck.rows[0].exists) {
                    message += 'geometry column not found... ';
                } else {
                    message += 'geometry column exists. Validating geometry... ';
                    // Verify geometry is valid and fix if needed
                    try {
                        await client.query(`
                            UPDATE bridges SET geometry = ST_MakeValid(geometry) WHERE geometry IS NOT NULL AND NOT ST_IsValid(geometry);
                        `);
                        message += 'Geometry validation complete. ';
                    } catch (geomError) {
                        message += `Geometry validation error: ${geomError.message}. `;
                    }
                }
            } else {
                message += 'PostGIS is not available. ';
            }
        } catch (postgisError) {
            message += `PostGIS check error: ${postgisError.message}. `;
        }
        
        // Step 4: Count records
        const countResult = await client.query('SELECT COUNT(*) FROM bridges');
        const count = parseInt(countResult.rows[0].count);
        message += `Bridge count: ${count}.`;
        
        await client.end();
        
        return json({ 
            success: true, 
            message,
            created,
            count
        });
    } catch (error) {
        console.error('Force setup failed:', error.message);
        console.error('Error details:', {
            code: error.code,
            detail: error.detail,
            hint: error.hint,
            position: error.position,
            where: error.where,
            internalQuery: error.internalQuery
        });
        
        return json({ 
            success: false, 
            error: error.message,
            code: error.code,
            detail: error.detail
        }, { status: 500 });
    }
}