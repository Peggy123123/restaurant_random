/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx,css,scss,sass}"],
    safelist: ["text-green-theme-500", "text-[96px]", "leading-none", "font-bold", "text-yellow-theme-500", "text-blue-secondary-400", "text-success-500", "break-all", "italic"],
    theme: {
        container: {
            center: true,
            padding: "1rem",
        },
        extend: {
            spacing: {
                4.5: "18px",
            },
            colors: {
                "primary": {
                    500: "#D36135",
                },
                "secondary": {
                    500: "#A24936",
                },
                "green-theme": {
                    500: "#83BCA9",
                },
                "orange-theme": {
                    0: "#FFF6ED",
                    400: "#FD853A",
                    500: "#FB6514",
                },
                "black-theme": {
                    500: "#282B28",
                },
                "gray-theme": {
                    0: "#F9FAFB",
                    100: "#F2F4F7",
                    200: "#EAECF0",
                    300: "#D0D5DD",
                    400: "#98A2B3",
                    500: "#667085",
                    600: "#475467",
                    700: "#1D2939",
                },
                success: {
                    0: "#ECFDF3",
                    500: "#12B76A",
                },
                warning: {
                    0: "#FFFAEB",
                    500: "#FDB022",
                },
                error: {
                    400: "#F97066",
                    500: "#F04438",
                },
            },
        },
    },
    plugins: [],
};
