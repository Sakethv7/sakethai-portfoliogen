# Deploy to GitHub Pages

## Setup Instructions

1. **Update vite.config.ts**
   - Replace `/your-repo-name/` with your actual GitHub repository name
   - For example, if your repo is `https://github.com/Sakethv7/my-portfolio`
   - Change it to: `/my-portfolio/`

2. **Add deploy scripts to package.json**
   Add these scripts to your package.json:
   ```json
   "scripts": {
     ...existing scripts,
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy to GitHub Pages**
   Run these commands in your terminal:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Repository**
   - Go to your GitHub repository
   - Click on Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Under "Branch", select "gh-pages" and "/ (root)"
   - Click Save

5. **Access Your Portfolio**
   Your portfolio will be available at:
   `https://[your-username].github.io/[your-repo-name]/`
   
   For example: `https://Sakethv7.github.io/your-repo-name/`

## Important Notes

- The first deployment may take a few minutes to become available
- Make sure your repository is public for GitHub Pages to work
- Update the base path in vite.config.ts with your actual repository name
- Every time you want to update your live portfolio, just run `npm run deploy`

## Custom Domain (Optional)

If you have a custom domain:
1. Create a file named `CNAME` in the public folder
2. Add your domain name (e.g., `portfolio.example.com`)
3. Configure DNS settings with your domain provider