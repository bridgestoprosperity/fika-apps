import { json } from '@sveltejs/kit';
import pg from 'pg';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, platform }) {
    try {
        // Get environment variables from all possible sources
        let connectionString = platform?.env?.DATABASE_URL || env.DATABASE_URL || process.env.DATABASE_URL;
        
        // If connection string uses the wrong domain, correct it
        if (connectionString && connectionString.includes('czujcujmkk4k')) {
            connectionString = connectionString.replace(
                'fika-impact-database.czujcujmkk4k.us-west-1.rds.amazonaws.com',
                'fika-impact-database.cdoaycgiqb5w.us-west-1.rds.amazonaws.com'
            );
        }
        
        if (!connectionString) {
            return json({ error: 'Database connection missing' }, { status: 500 });
        }

        // Parse query parameters
        const year = url.searchParams.get('year');
        const type = url.searchParams.get('type');
        const limit = url.searchParams.get('limit') || '120000';

        try {
            // Create client and connect
            const client = new pg.Client({ 
                connectionString,
                statement_timeout: 60000,
                connectionTimeoutMillis: 60000 
            });
            await client.connect();

            // Get the table structure to understand what columns we have
            const tableColumns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'bridges';
            `);
            
            // Construct a query based on detected columns
            const columnNames = tableColumns.rows.map(col => col.column_name);
            const hasGeom = tableColumns.rows.some(col => col.column_name === 'geometry');
            
            // Build query based on actual columns from the table structure
            const query = `
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
                    'Bridge' as name,
                    0 as span_length,
                    0 as communities_served,
                    0 as people_served
                FROM bridges
                WHERE 1=1
                ${year ? ' AND year_completed = $1' : ''}
                ${type ? ` AND bridge_type = $${year ? '2' : '1'}` : ''}
                LIMIT $${year && type ? '3' : (year || type ? '2' : '1')}
            `;

            // Set up query parameters
            const params = [];
            if (year) params.push(parseInt(year));
            if (type) params.push(type);
            params.push(parseInt(limit));

            // Execute the query
            const result = await client.query(query, params);
            await client.end();
            
            return json(result.rows);
        } catch (dbError) {
            return json({ 
                error: 'Database error', 
                details: dbError.message 
            }, { status: 500 });
        }
    } catch (error) {
        return json({ 
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    }
}