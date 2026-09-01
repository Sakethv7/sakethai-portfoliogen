# Saketh AI Portfolio

Static React/Vite portfolio for applied AI systems work: production analytics,
RAG evaluation, agent tooling, and public project writeups.

## Stack

- React 18, TypeScript, Vite
- Tailwind CSS and shadcn/ui primitives
- HashRouter for GitHub Pages compatibility
- `gh-pages` deployment from the generated `dist/` folder

## Local Development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run build
npm run lint
```

Current note: `npm run build` passes. `npm run lint` still reports pre-existing
shadcn template issues in `src/components/ui/*` and `tailwind.config.ts`; those
are not part of the route-splitting change.

## Routes

The app uses hash routes so GitHub Pages can serve every page from one static
`index.html`.

- `/`
- `/work`
- `/experience`
- `/writing`
- `/research`
- `/notes`

Non-home routes are lazy-loaded. This keeps the first JavaScript chunk smaller
for visitors who only land on the homepage.

## Deployment

```sh
npm run deploy
```

Do not deploy until the production build has been checked locally.
