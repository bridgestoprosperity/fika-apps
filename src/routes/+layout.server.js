import { env } from '$env/static/private';

/** @type {import('./$types').LayoutServerLoad} */
export function load() {
	return { analyticsId: env.VERCEL_ANALYTICS_ID };
}