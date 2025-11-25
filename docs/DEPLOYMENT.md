# Deployment Guide

This project can be deployed to GitHub Pages for a fully static experience or to Vercel for a managed hosting workflow. The POS app is already configured for static export with a customizable base path.

## Deploying to GitHub Pages
1. **Set the base path**
   - For a project page (e.g., `https://<user>.github.io/<repo>`), set the repo name as base path: `NEXT_PUBLIC_BASE_PATH=/REPO_NAME`.
   - For a user/organization page (e.g., `https://<user>.github.io`), leave it empty: `NEXT_PUBLIC_BASE_PATH=`.
2. **Build the static export**
   - From repo root: `cd apps/pos`
   - Install deps: `pnpm install`
   - Build with the base path: `NEXT_PUBLIC_BASE_PATH=/REPO_NAME pnpm run build:pages`
   - The static output lands in `apps/pos/out`.
3. **Publish to GitHub Pages**
   - Create a `gh-pages` branch and push the contents of `apps/pos/out` (you can use `git worktree` or an action).
   - If you use GitHub Actions, set an action that builds on `main` and deploys `apps/pos/out` to the `gh-pages` branch.
   - In repository settings → Pages, select `Deploy from a branch` and choose `gh-pages`/`root`.
4. **Verify**
   - Open `https://<user>.github.io/<repo>/` and confirm routes load with trailing slashes (the build uses static export with `trailingSlash: true`).

## Deploying to Vercel
1. **Import the repo** into Vercel and select the `apps/pos` directory as the root of the project.
2. **Environment variable**
   - Leave `NEXT_PUBLIC_BASE_PATH` empty unless you plan to serve from a subpath.
3. **Build settings**
   - Build command: `pnpm run build`
   - Output directory: `.next` (Vercel will handle serving). The app keeps SSR features on Vercel even though it can statically export.
4. **Monorepo note**
   - If prompted, set `apps/pos` as the framework root and ensure workspaces are enabled so shared packages (`@alfajor/ui`, `@alfajor/types`) are built.

## Testing locally with a base path
```
cd apps/pos
NEXT_PUBLIC_BASE_PATH=/REPO_NAME pnpm dev
```
Access the app at `http://localhost:3000/REPO_NAME/` to mirror the GitHub Pages path.
