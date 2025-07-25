export const palettes = {
	inferno: ['rgba(0, 0, 5, 0)', '#57106e', '#bc3754', '#f98e09', '#fcffa4'],
	magma: ['#000004', '#51127c', '#b73779', '#fc8961', '#fcfdbf'],
	plasma: ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921'],
	viridis: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
	cividis: ['#002051', '#3c4d6e', '#7f7c75', '#bbaf71', '#fdea45'],
	turbo: ['#23171b', '#26bce1', '#95fb51', '#ff821d', '#900c00'],
	warm: ['#6e40aa', '#d23ea7', '#ff5e63', '#efa72f', '#aff05b'],
	cool: ['#6e40aa', '#417de0', '#1ac7c2', '#40f373', '#aff05b'],
	// sequential single
	blues: ['rgba(240, 244, 255, 0)', 'rgba(189, 215, 231, 0.5)', '#6baed6', '#3182bd', '#08519c'],
	greens: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
	grays: ['#f7f7f7', '#cccccc', '#969696', '#636363', '#252525'],
	oranges: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603'],
	purples: ['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'],
	reds: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'],
	// sequential multi
	bugn: ['#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c'],
	bupu: ['#edf8fb', '#b3cde3', '#8c96c6', '#8856a7', '#810f7c'],
	gnbu: ['#f0f9e8', '#bae4bc', '#7bccc4', '#43a2ca', '#0868ac'],
	orrd: ['#fee8c8', '#fdbb84', '#e34a33', '#b30000'],
	pubu: ['#f1eef6', '#bdc9e1', '#74a9cf', '#2b8cbe', '#045a8d'],
	pubugn: ['#f6eff7', '#bdc9e1', '#67a9cf', '#1c9099', '#016c59'],
	puor: ['#f1a340', '#f7f7f7', '#998ec3', '#762a83'],
	purd: ['#e7e1ef', '#c994c7', '#dd1c77', '#980043', '#980043'],
	rdpu: ['#feebe2', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'],
	ylgn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#31a354'],
	ylgnbu: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
	ylorbr: ['#ffffe5', '#fff7bc', '#fec44f', '#d95f0e', '#993404'],
	ylorrd: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
	// diverging
	brbg: ['#a6611a', '#dfc27d', '#f5f5f5', '#80cdc1', '#018571'],
	prgn: ['#7b3294', '#c2a5cf', '#f7f7f7', '#a6dba0', '#008837'],
	piyg: ['#d01c8b', '#f1b6da', '#f7f7f7', '#b8e186', '#4dac26'],
	puor: ['#5e3c99', '#b2abd2', '#f7f7f7', '#fdb863', '#e66101'],
	rdbu: ['#ca0020', '#f4a582', '#F5EBCA', '#92c5de', '#0571b0'],
	rdgy: ['#ca0020', '#f4a582', '#ffffff', '#bababa', '#404040'],
	rdylbu: ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'],
	rdylgn: ['#d7191c', '#fdae61', '#ffffbf', '#a6d96a', '#1a9641'],
	spectral: ['#d7191c', '#fdae61', '#ffffbf', '#abdda4', '#2b83ba'],
	// custom
	salmonaqua: ['#e27c7c', '#6d4b4b', '#333333', '#466964', '#6cd4c5'],
	orangepurple: ['#ffb400', '#a57c1b', '#363445', '#5e569b', '#9080ff'],
	blueyellow: ['#115f9a', '#22a7f0', '#76c68f', '#c9e52f', '#d0f400'],

	// Modern matte sequential palettes
	stoplight: ['#c85a5a', '#e07a56', '#e6b366', '#a8c470', '#5f8a5f'],
	mattecoral: ['#f4e4e1', '#e8b4a0', '#d4795f', '#b85450', '#8b2f47'],
	dustyrose: ['#f5ece8', '#e7c4c0', '#d49c9a', '#bd7575', '#9d4e4e'],
	sage: ['#f0f2e8', '#d4dcc0', '#a8b894', '#7a9468', '#4d6b3c'],
	clay: ['#f7f0ea', '#e6d0bf', '#d1a584', '#b5794c', '#8f5a2e'],
	slate: ['#f4f5f7', '#d1d5db', '#9ca3af', '#6b7280', '#374151'],
	terracotta: ['#faf6f3', '#f0ddd1', '#deb5a0', '#c8886f', '#a8573f'],
	modernimpact: ['#7dd3c7', '#5bc5a8', '#42b883', '#2ca25f', '#1d7a3f'],

	// cyclical
	rainbow: ['#6e40aa', '#ff5e63', '#aff05b', '#1ac7c2', '#6e40aa'],
	sinebow: ['#ff4040', '#7fee11', '#00bfbf', '#7f11ee', '#ff4040'],
	// categorical
	tableau10: [
		'#4e79a7',
		'#f28e2c',
		'#e15759',
		'#76b7b2',
		'#59a14f',
		'#edc949',
		'#af7aa1',
		'#ff9da7',
		'#9c755f',
		'#bab0ab'
	],
	category10: [
		'#1f77b4',
		'#ff7f0e',
		'#2ca02c',
		'#d62728',
		'#9467bd',
		'#8c564b',
		'#e377c2',
		'#7f7f7f',
		'#bcbd22',
		'#17becf'
	],
	pastel: [
		'#fbb4ae',
		'#b3cde3',
		'#ccebc5',
		'#decbe4',
		'#fed9a6',
		'#ffffcc',
		'#e5d8bd',
		'#fddaec',
		'#f2f2f2'
	],
	violetocean: [
		'#93ECDD',
		'#7DD6E0',
		'#6DC0DE',
		'#66A9DA',
		'#5493D9',
		'#507CD4',
		'#5E60C7',
		'#6043C0',
		'#6A11B1',
		'#9F237E'
	]
};
