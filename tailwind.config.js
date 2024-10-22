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
				border: "hsl(var(--background-modifier-border))",
				input: "hsl(var(background-secondary-alt))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background-primary))",
				foreground: "hsl(var(--text-normal))",
				primary: {
					DEFAULT: "hsl(var(--background-primary))",
					foreground: "hsl(var(--text-normal))",
				},
				secondary: {
					DEFAULT: "hsl(var(--background-secondary))",
					foreground: "hsl(var(-text-on-accent))",
				},
				destructive: {
					DEFAULT: "hsl(var(--background-modifier-error))",
					foreground: "hsl(var(--text-error))",
				},
				muted: {
					DEFAULT: "hsl(var(--text-muted))",
					foreground: "hsl(var(--text-muted))",
				},
				accent: {
					DEFAULT: "hsl(var(--text-accent))",
					foreground: "hsl(var(--text-accent))",
				},
				success: {
					DEFAULT: "hsl(var(--interactive-success))",
					foreground: "hsl(var(--interactive-success))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--modal-background))",
					foreground: "hsl(var(--text-normal))",
				},
			},
			borderRadius: {
				lg: `var(--modal-radius)`,
				md: `calc(var(--checkbox-radius) - 2px)`,
				sm: "calc(var(--button-radius) - 4px)",
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
