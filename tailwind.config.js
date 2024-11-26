import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	plugins: [typography, require('daisyui')],
	daisyui: {
		themes: [ 'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter', 'dim', 'nord', 'sunset',{ b2ptheme: { "primary": "#009149", "secondary": "#161345", "accent": "#66C3E3", "neutral": "#D7D1CB", "base-100": "#FFFFFF", "info": "#EA7149", "success": "#6A9F58", "warning": "#E49344", "error": "#D1605E", }, }, ]
	}
};
