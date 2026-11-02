# Anmol Kumar — Portfolio

Professional developer portfolio for Anmol Kumar, Mobile Application Developer (iOS & Flutter).

Public URL target: `https://anmolkumar2003.github.io/Portfolio/`

This source project is separate from the existing public `Portfolio` repository. Nothing is pushed or deployed until you approve it.

## Scripts

- `npm run dev` — local development at `/Portfolio/`
- `npm run build` — typecheck and production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build

## Resume

Place the PDF at `public/Anmol-Kumar-Resume.pdf` and set `resumeUrl` in `src/data/profile.data.ts`. The download button stays hidden until that value is set.

## GitHub Pages

- `base` is `/Portfolio/`
- `.github/workflows/deploy.yml` deploys this repository’s Pages, if enabled
- `.github/workflows/deploy-public.yml` is **manual only** and can publish `dist/` to `anmolkumar2003/Portfolio` using `PORTFOLIO_DEPLOY_TOKEN`
