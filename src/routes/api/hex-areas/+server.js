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
		const hexID = url.searchParams.get('hexID');

		if (!hexID) {
			return json(
				{
					error: 'Missing hexID parameter',
					details: 'hexID query parameter is required'
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

			// Check if hex_areas table exists
			const tableCheckQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'hex_areas'
                );
            `;

			const tableExists = await client.query(tableCheckQuery);

			if (!tableExists.rows[0].exists) {
				console.warn('hex_areas table does not exist');
				return json(
					{
						error: 'Table not found',
						details: 'The hex_areas table does not exist in the database'
					},
					{ status: 500 }
				);
			}

			// Query for the specific hex by hexID
			const query = `
                SELECT * FROM hex_areas 
                WHERE h3_index = $1
            `;

			// Execute the query with parameterized input for security
			const result = await client.query(query, [hexID]);
			await client.end();

			// Check if we found the hex
			if (result.rows.length === 0) {
				return json(
					{
						error: 'Hex not found',
						details: `No hex found with ID: ${hexID}`
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
