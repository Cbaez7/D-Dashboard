export const THEME_STORAGE_KEY = "bng-theme";

export type Theme = "default" | "gold" | "light";

export const THEMES: { value: Theme; label: string; hint: string }[] = [
  { value: "default", label: "Default", hint: "Original dark" },
  { value: "gold", label: "Gold", hint: "Solvys warm dark" },
  { value: "light", label: "Light", hint: "Light mode" },
];

export function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "default") {
    delete el.dataset.theme;
  } else {
    el.dataset.theme = theme;
  }
}

export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="gold"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;
