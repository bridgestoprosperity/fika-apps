import { json } from '@sveltejs/kit';
import pg from 'pg';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, platform }) {
    try {
        // Get database connection string
        const connectionString = platform?.env?.DATABASE_URL || env.DATABASE_URL;
        
        // Require a database connection
        if (!connectionString) {
            return json({ 
                error: 'Database connection missing',
                details: 'No connection string provided' 
            }, { status: 500 });
        }

        // Parse query parameters
        const limit = url.searchParams.get('limit') || '1000';
        const column = url.searchParams.get('column') || 'population';

        try {
            // Create client and connect
            const client = new pg.Client({ 
                connectionString,
                statement_timeout: 30000,
                connectionTimeoutMillis: 30000 
            });
            
            // Proper error handling for connection
            try {
                await client.connect();
            } catch (connectError) {
                console.error('Failed to connect to database:', connectError);
                return json({ 
                    error: 'Database connection failed',
                    details: connectError.message 
                }, { status: 500 });
            }

            // Check if hex_data table exists
            const tableCheckQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'hex_data'
                );
            `;
            
            const tableExists = await client.query(tableCheckQuery);
            
            if (!tableExists.rows[0].exists) {
                console.warn('hex_data table does not exist');
                return json({ 
                    error: 'Table not found',
                    details: 'The hex_data table does not exist in the database' 
                }, { status: 500 });
            }
            
            // First get just a couple rows to check the structure
            const structureQuery = `
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'hex_data'
            `;
            
            const columns = await client.query(structureQuery);
            const columnNames = columns.rows.map(row => row.column_name);
            
            console.log("Available columns:", columnNames);
            
            // Based on the available columns, build a query
            const hasGeometry = columnNames.includes('geometry');
            const hasH3Index = columnNames.includes('h3_index');
            const hasPopulation = columnNames.includes('population');
            const hasTravelTime = columnNames.includes('travel_time');
            
            // Build a safer query
            const query = `
                SELECT 
                    ${hasH3Index ? 'h3_index as id,' : 'CAST(ROW_NUMBER() OVER () AS TEXT) as id,'}
                    ${hasGeometry ? 'ST_AsGeoJSON(geometry) as geojson,' : ''}
                    ${hasGeometry ? 'CAST(ST_X(ST_Centroid(geometry)) AS DECIMAL(10,6)) as longitude,' : ''}
                    ${hasGeometry ? 'CAST(ST_Y(ST_Centroid(geometry)) AS DECIMAL(10,6)) as latitude,' : ''}
                    ${hasPopulation ? 'population,' : ''}
                    ${hasTravelTime ? 'travel_time' : 'NULL as travel_time'}
                FROM hex_data
                LIMIT $1
            `;

            // Set up query parameters
            const params = [parseInt(limit)];

            // Execute the query
            const result = await client.query(query, params);
            await client.end();
            
            // Check if we got data
            if (result.rows.length === 0) {
                return json({ 
                    error: 'No data found',
                    details: 'The hex_data table exists but contains no data' 
                }, { status: 404 });
            }
            
            // If we didn't get geojson but have latitude/longitude, that's still usable
            if (!result.rows.some(row => row.geojson) && result.rows.some(row => row.longitude && row.latitude)) {
                console.log("No GeoJSON in results, but have lat/lon for centroid-based display");
            }
            
            return json(result.rows);
        } catch (dbError) {
            console.error('Database error:', dbError);
            // Return error for client to handle
            return json({ 
                error: 'Database error',
                details: dbError.message 
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Server error:', error);
        return json({ 
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    }
}