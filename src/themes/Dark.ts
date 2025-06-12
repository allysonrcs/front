import { createTheme } from "@mui/material";

export const DarkTheme = createTheme({
    typography: {
        fontFamily: "Roboto, sans-serif",
        h6: {
            fontSize: "14px",
            lineHeight: 1.4,
        },
        h5: {
            fontSize: "16px",
        },
        h4: {
            fontSize: "18px",
        },
    },
    palette: {
        mode: "dark",
        primary: {
            main: "#00AE9D",
            dark: "#009688",
            light: "#00AE9D",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#025e70",
            dark: "#038099",
            light: "#025e70",
            contrastText: "#ffffff",
        },
        success: {
            main: "#7DB61C",
            dark: "#679c0e",
            light: "#7DB61C",
            contrastText: "#ffffff",
        },
        info: {
            main: "#49479d",
            dark: "#39378c",
            light: "#49479d",
            contrastText: "#ffffff",
        },
        warning: {
            main: "#c9d200",
            dark: "#a1a800",
            light: "#c9d200",
            contrastText: "#ffffff",
        },
        error: {
            main: "#dc2626",
            dark: "#b91c1c",
            light: "#dc2626",
            contrastText: "#ffffff",
        },
        background: {
            paper: "#00232b",
            default: "#00161b",
        },
    },
});
