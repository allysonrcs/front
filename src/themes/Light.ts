import { createTheme } from "@mui/material";

export const LightTheme = createTheme({
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
        primary: {
            main: "#009688",
            dark: "#00786c",
            light: "#009688",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#025e70",
            dark: "#003641",
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
            paper: "#ffffff",
            default: "#F4F6F8",
        },
    },
});
