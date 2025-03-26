import { json } from '@sveltejs/kit';
import pg from 'pg';
import { env } from '$env/dynamic/private';

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
        
        // For debugging only - print the first part and last part of the connection string
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
            // Increased timeout to 1 minute for testing
            statement_timeout: 60000,
            // Connection timeout
            connectionTimeoutMillis: 60000
        });
        
        await client.connect();
        console.log('Connected to PostgreSQL');
        
        // Simple query to verify connection
        const result = await client.query('SELECT current_database() as db, current_user as user, version() as version');
        await client.end();
        
        return json({ 
            success: true, 
            message: 'Connection successful',
            database: result.rows[0].db,
            user: result.rows[0].user,
            version: result.rows[0].version
        });
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return json({ 
            success: false, 
            error: error.message,
            code: error.code,
            detail: error.detail
        }, { status: 500 });
    }
}