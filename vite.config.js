import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Make sure environment variables are properly loaded
	server: {
		fs: {
			// Allow serving files from the project root
			allow: ['.']
		}
	}
});
