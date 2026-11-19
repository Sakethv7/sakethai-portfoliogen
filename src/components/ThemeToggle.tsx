import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// One button. The label names the action. Before the theme is known it renders an empty
// button of the same size, so the header does not shift (ADR-051).
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  if (!mounted) return <button type="button" className="theme-toggle" aria-hidden="true" tabIndex={-1} />;
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}
