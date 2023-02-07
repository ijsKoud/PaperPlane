/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [],
	theme: {
		extend: {
			fontSize: {
				note: ["9.2px", { fontWeight: 600 }],
				comment: ["11.5px", { fontWeight: 600 }],
				small: ["14.4px", { fontWeight: 600 }],
				base: ["18px", { fontWeight: 400 }],
				lg: ["22.5px", { fontWeight: 600 }],
				xl: ["28.13px", { fontWeight: 600 }],
				"2xl": ["35.16px", { fontWeight: 600 }],
				"3xl": ["43.95px", { fontWeight: 600 }],
				"4xl": ["54.9px", { fontWeight: 700, lineHeight: "50px" }]
			},
			backgroundImage: {
				login: "url('/backgrounds/login.svg')"
			},
			colors: {
				// main
				"main-100": "rgba(36,37,38,0.1)",
				"main-200": "rgba(36,37,38,0.2)",
				"main-300": "rgba(36,37,38,0.3)",
				"main-400": "rgba(36,37,38,0.4)",
				"main-500": "rgba(36,37,38,0.5)",
				"main-600": "rgba(36,37,38,0.6)",
				"main-700": "rgba(36,37,38,0.7)",
				"main-800": "rgba(36,37,38,0.8)",
				"main-900": "rgba(36,37,38,0.9)",
				main: "rgba(36,37,38,1)",

				// white
				white: "rgba(255, 255, 255, 1)",
				"white-900": "rgba(255, 255, 255, 0.9)",
				"white-800": "rgba(255, 255, 255, 0.8)",
				"white-700": "rgba(255, 255, 255, 0.7)",
				"white-600": "rgba(255, 255, 255, 0.6)",
				"white-500": "rgba(255, 255, 255, 0.5)",
				"white-400": "rgba(255, 255, 255, 0.4)",
				"white-300": "rgba(255, 255, 255, 0.3)",
				"white-200": "rgba(255, 255, 255, 0.2)",
				"white-100": "rgba(255, 255, 255, 0.1)",

				// black
				black: "rgba(0, 0, 0, 1)",
				"black-900": "rgba(0, 0, 0, 0.9)",
				"black-800": "rgba(0, 0, 0, 0.8)",
				"black-700": "rgba(0, 0, 0, 0.7)",
				"black-600": "rgba(0, 0, 0, 0.6)",
				"black-500": "rgba(0, 0, 0, 0.5)",
				"black-400": "rgba(0, 0, 0, 0.4)",
				"black-300": "rgba(0, 0, 0, 0.3)",
				"black-200": "rgba(0, 0, 0, 0.2)",
				"black-100": "rgba(0, 0, 0, 0.1)",

				// bg
				"bg-dark": "#1F2021",

				// primary
				"primary-100": "rgba(75,95,115,0.1)",
				"primary-200": "rgba(75,95,115,0.2)",
				"primary-300": "rgba(75,95,115,0.3)",
				"primary-400": "rgba(75,95,115,0.4)",
				"primary-500": "rgba(75,95,115,0.5)",
				"primary-600": "rgba(75,95,115,0.6)",
				"primary-700": "rgba(75,95,115,0.7)",
				"primary-800": "rgba(75,95,115,0.8)",
				"primary-900": "rgba(75,95,115,0.9)",
				primary: "rgba(75,95,115,1)",

				// secondary
				"secondary-100": "rgba(41,53,64,0.1)",
				"secondary-200": "rgba(41,53,64,0.2)",
				"secondary-300": "rgba(41,53,64,0.3)",
				"secondary-400": "rgba(41,53,64,0.4)",
				"secondary-500": "rgba(41,53,64,0.5)",
				"secondary-600": "rgba(41,53,64,0.6)",
				"secondary-700": "rgba(41,53,64,0.7)",
				"secondary-800": "rgba(41,53,64,0.8)",
				"secondary-900": "rgba(41,53,64,0.9)",
				secondary: "rgba(41,53,64,1)",

				// highlight
				"highlight-100": "rgba(79,77,140,0.1)",
				"highlight-200": "rgba(79,77,140,0.2)",
				"highlight-300": "rgba(79,77,140,0.3)",
				"highlight-400": "rgba(79,77,140,0.4)",
				"highlight-500": "rgba(79,77,140,0.5)",
				"highlight-600": "rgba(79,77,140,0.6)",
				"highlight-700": "rgba(79,77,140,0.7)",
				"highlight-800": "rgba(79,77,140,0.8)",
				"highlight-900": "rgba(79,77,140,0.9)",
				highlight: "rgba(79,77,140,1)",

				// blue
				"blue-100": "rgba(0,112,243,0.1)",
				"blue-200": "rgba(0,112,243,0.2)",
				"blue-300": "rgba(0,112,243,0.3)",
				"blue-400": "rgba(0,112,243,0.4)",
				"blue-500": "rgba(0,112,243,0.5)",
				"blue-600": "rgba(0,112,243,0.6)",
				"blue-700": "rgba(0,112,243,0.7)",
				"blue-800": "rgba(0,112,243,0.8)",
				"blue-900": "rgba(0,112,243,0.9)",
				blue: "rgba(0,112,243,1)",

				// green
				"green-100": "rgba(12,205,107,0.1)",
				"green-200": "rgba(12,205,107,0.2)",
				"green-300": "rgba(12,205,107,0.3)",
				"green-400": "rgba(12,205,107,0.4)",
				"green-500": "rgba(12,205,107,0.5)",
				"green-600": "rgba(12,205,107,0.6)",
				"green-700": "rgba(12,205,107,0.7)",
				"green-800": "rgba(12,205,107,0.8)",
				"green-900": "rgba(12,205,107,0.9)",
				green: "rgba(12,205,107,1)",

				// red
				"red-100": "rgba(234,59,62,0.1)",
				"red-200": "rgba(234,59,62,0.2)",
				"red-300": "rgba(234,59,62,0.3)",
				"red-400": "rgba(234,59,62,0.4)",
				"red-500": "rgba(234,59,62,0.5)",
				"red-600": "rgba(234,59,62,0.6)",
				"red-700": "rgba(234,59,62,0.7)",
				"red-800": "rgba(234,59,62,0.8)",
				"red-900": "rgba(234,59,62,0.9)",
				red: "rgba(234,59,62,1)"
			}
		}
	},
	plugins: []
};
