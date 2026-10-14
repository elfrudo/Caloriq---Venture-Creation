import type { Config } from "tailwindcss";
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: c("bg"), fg: c("fg"), card: c("card"), muted: c("muted"), border: c("border"), primary: c("primary"), secondary: c("secondary") } } },
  plugins: [],
};
export default config;
