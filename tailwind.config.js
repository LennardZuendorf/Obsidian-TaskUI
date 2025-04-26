/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{ts,tsx}", "./index.html"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "var(--background-modifier-border)",
				input: "var(--background-secondary-alt)",
				ring: "var(--background-secondary-alt)",
				background: "var(--background-primary)",
				foreground: "var(--text-normal)",
				primary: {
					DEFAULT: "var(--background-primary)",
					foreground: "var(--text-normal)",
				},
				secondary: {
					DEFAULT: "var(--background-secondary)",
					foreground: "var(--text-on-accent)",
				},
				destructive: {
					DEFAULT: "var(--background-modifier-error)",
					foreground: "var(--text-error)",
				},
				muted: {
					DEFAULT: "var(--text-muted)",
					foreground: "var(--text-muted)",
				},
				accent: {
					DEFAULT: "var(--text-accent)",
					foreground: "var(--text-on-accent)",
				},
				success: {
					DEFAULT: "var(--interactive-success)",
					foreground: "var(--text-on-accent)",
				},
				popover: {
					DEFAULT: "var(--modal-background)",
					foreground: "var(--text-on-accent)",
				},
				card: {
					DEFAULT: "var(--modal-background)",
					foreground: "var(--text-normal)",
				},
			},
			borderRadius: {
				lg: `var(--modal-radius)`,
				md: `var(--checkbox-radius)`,
				sm: "0.1rem",
			},
			fontFamily: {
				sans: ["var(---font-interface-theme)"],
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
