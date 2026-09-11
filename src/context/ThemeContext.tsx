import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const lightVars: Record<string, string> = {
      "--backgroundColor": "#eef0f4",
      "--bgColor": "#eef0f4",
      "--surfaceColor": "#ffffff",
      "--surfaceColor2": "#f4f6f9",
      "--textColor": "#1b1b1f",
      "--textColorDim": "rgba(0,0,0,0.7)",
      "--textColorFaint": "rgba(0,0,0,0.5)",
      "--borderColor": "rgba(0,0,0,0.12)",
      "--shadowColor": "rgba(0,0,0,0.15)",
      "--overlayColor": "rgba(255,255,255,0.85)",
    };
    if (theme === "light") {
      root.classList.add("light-mode");
      Object.entries(lightVars).forEach(([key, value]) =>
        root.style.setProperty(key, value)
      );
    } else {
      root.classList.remove("light-mode");
      Object.keys(lightVars).forEach((key) => root.style.removeProperty(key));
    }
    document.body.style.backgroundColor = "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
