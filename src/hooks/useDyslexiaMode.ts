import { useEffect, useState } from "react";

export const useDyslexiaMode = () => {
  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.getAttribute("data-dyslexia") === "true";
  });

  useEffect(() => {
    if (isDyslexiaMode) {
      document.documentElement.setAttribute("data-dyslexia", "true");
      localStorage.setItem("dyslexia-mode", "true");
    } else {
      document.documentElement.removeAttribute("data-dyslexia");
      localStorage.removeItem("dyslexia-mode");
    }
  }, [isDyslexiaMode]);

  useEffect(() => {
    const stored = localStorage.getItem("dyslexia-mode");
    if (stored === "true") {
      setIsDyslexiaMode(true);
    }
  }, []);

  const toggleDyslexiaMode = () => setIsDyslexiaMode((prev) => !prev);

  return { isDyslexiaMode, toggleDyslexiaMode };
};
