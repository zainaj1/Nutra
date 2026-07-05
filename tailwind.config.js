const setupColors = require("./src/app/(app)/(tabs)/(setup)/setup-colors.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                setup: {
                    primary: setupColors.primary,
                    dark: setupColors.dark,
                    light: setupColors.light,
                    border: setupColors.border,
                    muted: setupColors.muted,
                },
            },
        },
    },
    plugins: [],
}
