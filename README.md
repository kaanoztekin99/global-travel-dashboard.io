# Global Travel Dashboard

This project is prepared for GitHub Pages deployment.

## GitHub Pages setup

1. Create a new repository on GitHub named `project-github-io` (or another name you prefer).
2. Add the remote repository locally:

   ```bash
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

3. In the GitHub repository settings, enable GitHub Pages with:
   - Branch: `main`
   - Folder: `/docs`

4. After saving, the live site will appear at:
   `https://<username>.github.io/<repo-name>/`

## Local preview

Open `docs/index.html` directly, or run a local static server in the project root:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/docs/index.html`.

## Notes

- The site source is inside the `docs/` folder.
- The `.nojekyll` file is included so GitHub Pages serves the static site without Jekyll processing.
