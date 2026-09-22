# Stitch frontend previews

The HTML exports and Design.md are original design references. Their matching JSX files in `../src/pages` are React page components styled with locally compiled Tailwind CSS. No component library or CDN Tailwind runtime is used.

Run `npm run dev` from frontend and open:

- `/` or `/home` — Home
- `/products/:id` (for example `/products/demo`) — Product details
- `/cart` — Shopping cart

Design tokens live in src/index.css and Tailwind is registered in vite.config.js. Exported scripts and inline event handlers are intentionally not executed. Product data, cart counts, forms, demo-state controls, and payment actions are static placeholders for later integration. Fonts, icons, and remote product images still require network access.

React Router routes are declared in `src/App.jsx`. Page sections use JSX comments to identify their layout responsibilities.

React Router routes are declared in `src/App.jsx`. Page sections use JSX comments to identify their layout responsibilities.
