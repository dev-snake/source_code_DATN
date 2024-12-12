const { nextui } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
		'./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		extend: {
			colors: {
				dark: "#292929",
				momo: "#d82d8b",
				secondary: {
					DEFAULT: '#6BD3D2',
					50: '#E7F8F8',
					100: '#D9F4F3',
					200: '#BEECEB',
					300: '#A2E3E3',
					400: '#87DBDA',
					500: '#6BD3D2',
					600: '#4CCAC8',
					700: '#36B6B5',
					800: '#2D9796',
					900: '#237777',
					950: '#1F6867'
				},

			},
			boxShadow: {
				custom: "0px 8px 32px 0px rgba(0, 0, 0, 0.12)"
			}
		}
	},
	darkMode: 'class',
	plugins: [
		nextui({
			themes: {
				light: {
					colors: {
						primary: {
							DEFAULT: '#fa748f',
							foreground: '#ffffff'
						},
						secondary: {
							DEFAULT: '#6bd3d2',
							foreground: '#ffffff'
						},
						success: {
							DEFAULT: '#9FD4A3',
							foreground: '#ffffff'
						},
						danger: {
							DEFAULT: '#cc293d',
							foreground: '#ffffff'
						},
						warning: {
							DEFAULT: '#f5d400',
							foreground: '#ffffff'
						}
					}
				}
			}
		})
	]
};
