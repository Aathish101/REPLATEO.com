import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState("neutral");

  // Detect theme based on pathname
  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path.startsWith("/edible")) {
      setTheme("edible");
    } else if (path.startsWith("/non-edible")) {
      setTheme("nonedible");
    } else {
      setTheme("neutral");
    }
  }, [location]);

  // Apply theme class to <body>
  useEffect(() => {
    document.body.classList.remove("theme-edible", "theme-nonedible", "theme-neutral");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
