// Tailwind CDN runtime configuration.
// Extends the default theme with the project's design tokens
// (color palette, font stacks) so utility classes like
// `bg-paper`, `text-signal`, `font-display` work everywhere.
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper:   { DEFAULT: '#F6F4EF', dark: '#14181A' },
        panel:   '#FFFFFF',
        panel2:  '#EFEBE2',
        ink:     '#1B1F1D',
        inkdim:  '#5B6460',
        line:    '#D8D2C4',
        signal:  '#1F7A5C',
        signalsoft: '#DCEFE6',
        noise:   '#B5552C',
        noisesoft: '#F6E2D6',
        accent:  '#2D5C73',
        accentsoft: '#DCE8EC',
        warn:    '#A8431A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,31,29,0.06), 0 8px 24px rgba(27,31,29,0.06)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
};
