# Anmol Kumar — Portfolio

Professional developer portfolio for Anmol Kumar, Mobile Application Developer (iOS & Flutter).

Public URL targets:
- GitHub Pages: `https://anmolkumar2003.github.io/Portfolio/`
- Vercel: `https://anmolios.vercel.app`

This source project is separate from the existing public `Portfolio` repository. Nothing is pushed or deployed until you approve it.

## Scripts

- `npm run dev` — local development (base follows `VITE_BASE_PATH` / defaults)
- `npm run build` — typecheck and production build (auto base: `/` on Vercel, `/Portfolio/` elsewhere)
- `npm run build:pages` — force GitHub Pages base `/Portfolio/`
- `npm run build:vercel` — force Vercel root base `/`
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

## Resume

Place the PDF at `public/Anmol_Kumar_CV.pdf`. Configure the filename in `src/data/resume.data.ts`. The download button stays hidden until that file exists.

## Deployment bases

- Vite `base` resolves from `VITE_BASE_PATH`, else `VERCEL=1` → `/`, else `/Portfolio/`
- Vercel: Framework Vite, output `dist`, build `npm run build` (see `vercel.json`)
- GitHub Pages: `.github/workflows/deploy.yml` deploys this repository’s Pages, if enabled
- `.github/workflows/deploy-public.yml` is **manual only** and can publish `dist/` to `anmolkumar2003/Portfolio` using `PORTFOLIO_DEPLOY_TOKEN`
