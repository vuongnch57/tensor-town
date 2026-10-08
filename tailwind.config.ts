import type { Config } from 'tailwindcss';
import tokens from './design/tokens.json';

// UI colour tokens switch light/dark through CSS variables (src/index.css).
// Scene tokens are fixed daylight values and are also read by three/core/palette.ts.
const ui = ['surface-100', 'surface-200', 'surface-300', 'line', 'ink', 'muted', 'accent', 'accent-ink', 'accent-soft', 'warn', 'warn-soft', 'marker'];

const colors: Record<string, string> = {};
for (const t of tokens.color.tokens) {
  colors[t.name] = ui.includes(t.name) ? `rgb(var(--${t.name}) / <alpha-value>)` : (t.value as string);
}

const px = (list: { name: string; value: string }[], prefix: string) =>
  Object.fromEntries(list.map((t) => [t.name.replace(prefix, ''), t.value]));

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: { sans: [tokens.type.families.sans] },
      spacing: px(tokens.spacing.tokens, 'space-'),
      borderRadius: px(tokens.radius.tokens, 'radius-'),
      boxShadow: { panel: 'var(--shadow-panel)', marker: 'var(--shadow-marker)' },
    },
  },
  plugins: [],
} satisfies Config;
