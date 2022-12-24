/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	content: [],
	theme: {
		extend: {
			fontSize: {
				note: ["9.2px", { fontWeight: 600 }],
				comment: ["9.2px", { fontWeight: 600 }],
				small: ["9.2px", { fontWeight: 600 }],
				base: ["18px", { fontWeight: 400 }],
				lg: ["22.5px", { fontWeight: 600 }],
				xl: ["28.13px", { fontWeight: 600 }],
				"2xl": ["35.16px", { fontWeight: 600 }],
				"3xl": ["43.95px", { fontWeight: 600 }],
				"4xl": ["54.9x", { fontWeight: 700, lineHeight: "50px" }]
			},
			colors: {
				white: "rgba(225, 225, 225, 1)",
				"white-900": "rgba(225, 225, 225, .9)",
				"white-800": "rgba(225, 225, 225, .8)",
				"white-700": "rgba(225, 225, 225, .7)",
				"white-600": "rgba(225, 225, 225, .6)",
				"white-500": "rgba(225, 225, 225, .5)",
				"white-400": "rgba(225, 225, 225, .4)",
				"white-300": "rgba(225, 225, 225, .3)",
				"white-200": "rgba(225, 225, 225, .2)",
				"white-100": "rgba(225, 225, 225, .1)",
				"bg-dark": "#1F2021"
			}
		}
	},
	plugins: []
};
