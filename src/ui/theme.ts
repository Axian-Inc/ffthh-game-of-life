import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#35c6b3"
    },
    secondary: {
      main: "#4aa3ff"
    },
    background: {
      default: "#fbfaf7",
      paper: "#ffffff"
    },
    text: {
      primary: "#1f2937",
      secondary: "#64748b"
    }
  },
  typography: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 16
  }
});
