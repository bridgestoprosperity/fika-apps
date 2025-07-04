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
			return json(
				{
					error: 'Database connection missing',
					details: 'No connection string provided'
				},
				{ status: 500 }
			);
		}

		// Parse query parameters
		const bridgeIndex = url.searchParams.get('bridgeIndex');

		if (!bridgeIndex) {
			return json(
				{
					error: 'Missing bridgeIndex parameter',
					details: 'bridgeIndex query parameter is required'
				},
				{ status: 400 }
			);
		}

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
				return json(
					{
						error: 'Database connection failed',
						details: connectError.message
					},
					{ status: 500 }
				);
			}

			// Check if bridges table exists
			const tableCheckQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'bridges'
                );
            `;

			const tableExists = await client.query(tableCheckQuery);

			if (!tableExists.rows[0].exists) {
				console.warn('bridges table does not exist');
				return json(
					{
						error: 'Table not found',
						details: 'The bridges table does not exist in the database'
					},
					{ status: 500 }
				);
			}

			// Query for the specific bridge by index
			const query = `
                SELECT * FROM bridges 
                WHERE bridge_index = $1
            `;

			// Execute the query with parameterized input for security
			const result = await client.query(query, [parseInt(bridgeIndex)]);
			await client.end();

			// Check if we found the bridge
			if (result.rows.length === 0) {
				return json(
					{
						error: 'Bridge not found',
						details: `No bridge found with index: ${bridgeIndex}`
					},
					{ status: 404 }
				);
			}

			return json(result.rows[0]);
		} catch (dbError) {
			console.error('Database error:', dbError);
			// Return error for client to handle
			return json(
				{
					error: 'Database error',
					details: dbError.message
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Server error:', error);
		return json(
			{
				error: 'Server error',
				details: error.message
			},
			{ status: 500 }
		);
	}
}