const setupColors = require("./src/app/(app)/domain/setup-colors.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                green: {
                    50: setupColors.soft,
                    100: setupColors.selected,
                    600: setupColors.primary,
                    700: setupColors.dark,
                },
                olive: {
                    400: setupColors.olive,
                },
                leaf: {
                    500: setupColors.leaf,
                },
                cream: {
                    50: setupColors.cream,
                    100: setupColors.card,
                },
                border: {
                    light: setupColors.border,
                },
                orange: {
                    500: setupColors.orange,
                },
                yellow: {
                    400: setupColors.yellow,
                },
                purple: {
                    300: setupColors.purple,
                },
                setup: {
                    primary: setupColors.primary,
                    dark: setupColors.dark,
                    soft: setupColors.soft,
                    selected: setupColors.selected,
                    olive: setupColors.olive,
                    leaf: setupColors.leaf,
                    cream: setupColors.cream,
                    card: setupColors.card,
                    border: setupColors.border,
                    main: setupColors.textMain,
                    muted: setupColors.textMuted,
                    textOlive: setupColors.textOlive,
                    orange: setupColors.orange,
                    yellow: setupColors.yellow,
                    purple: setupColors.purple,
                },
                text: {
                    main: setupColors.textMain,
                    muted: setupColors.textMuted,
                    olive: setupColors.textOlive,
                },
            },
        },
    },
    plugins: [],
}
