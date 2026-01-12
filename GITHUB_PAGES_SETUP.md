# GitHub Pages Setup Guide

## Your Support URL

Based on your GitHub username, your support page should be at:

```
https://stuartepworth1-web.github.io/Sondare/support.html
```

## Verification Steps

### 1. Check Repository Settings

1. Go to your repository: `https://github.com/stuartepworth1-web/Sondare`
2. Click **Settings** (top right)
3. Scroll down to **Pages** (in the left sidebar under "Code and automation")
4. Verify the following settings:

   **Source:** Deploy from a branch

   **Branch:** `main` (or `master`)

   **Folder:** `/docs`

5. Look for a blue or green banner at the top that says:
   - ✅ "Your site is live at https://stuartepworth1-web.github.io/Sondare/"

### 2. Check Repository Name

Your repository MUST be named exactly: **Sondare** (case-sensitive)

If it's named something else:
1. Go to Settings
2. Scroll down to "Repository name"
3. Rename it to `Sondare`
4. Click "Rename"

### 3. Check Repository Visibility

GitHub Pages for **private repositories** requires a paid GitHub plan.

To make your repository public:
1. Go to Settings
2. Scroll to the bottom: "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make public"
5. Type the repository name to confirm

### 4. Check Deployment Status

1. Go to the **Actions** tab in your repository
2. Look for "pages-build-deployment" workflows
3. Check the status:
   - ✅ Green checkmark = Successfully deployed
   - ⏳ Yellow dot = Still deploying (wait 2-5 minutes)
   - ❌ Red X = Failed (click to see error details)

If deployment failed:
- Click on the failed workflow
- Check the error message
- Common issues:
  - Repository is private (needs paid plan or make it public)
  - No `docs` folder in main branch
  - Branch name mismatch

### 5. Verify Files Are in Repository

Make sure these files exist in the `docs` folder on GitHub:
- `index.html`
- `support.html`
- `privacy-policy.html`
- `terms-of-service.html`

To check:
1. Go to your repository root
2. Click on the `docs` folder
3. Verify all 4 files are there

### 6. Test Your URLs

Once GitHub Pages is enabled and deployed, test these URLs:

1. **Main page:** https://stuartepworth1-web.github.io/Sondare/
2. **Support:** https://stuartepworth1-web.github.io/Sondare/support.html
3. **Privacy Policy:** https://stuartepworth1-web.github.io/Sondare/privacy-policy.html
4. **Terms:** https://stuartepworth1-web.github.io/Sondare/terms-of-service.html

## Common Issues and Solutions

### Issue: 404 Not Found

**Possible Causes:**
1. Repository name doesn't match URL
2. Files aren't committed to the main/master branch
3. GitHub Pages isn't enabled
4. Deployment is still in progress

**Solutions:**
- Double-check repository name is exactly "Sondare"
- Commit and push the `docs` folder
- Wait 2-5 minutes for deployment
- Check Actions tab for deployment status

### Issue: "Site not found" or won't enable

**Possible Cause:** Repository is private

**Solution:**
- Make repository public (free)
- OR upgrade to GitHub Pro/Team/Enterprise

### Issue: Files show but styling is broken

**Possible Cause:** CSS/images aren't loading

**Solution:**
- Check if all assets are in the docs folder
- Verify paths in HTML are relative (not absolute)
- Clear browser cache and reload

### Issue: Changes not showing up

**Possible Cause:** Caching or deployment delay

**Solution:**
- Wait 2-5 minutes after pushing changes
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check Actions tab to verify new deployment ran

## App Store Connect Configuration

Once your GitHub Pages is working, update App Store Connect:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app "Sondare"
3. Go to **App Information**
4. Under **Support URL**, enter:
   ```
   https://stuartepworth1-web.github.io/Sondare/support.html
   ```
5. Click **Save**

Also update:
- **Privacy Policy URL:**
  ```
  https://stuartepworth1-web.github.io/Sondare/privacy-policy.html
  ```

## Alternative: Using Vercel (Recommended)

If GitHub Pages continues to have issues, you can use Vercel instead (it's free and faster):

### Quick Vercel Setup

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Click "Import Project"
4. Select your Sondare repository
5. Under "Root Directory", select `docs`
6. Click "Deploy"

You'll get a URL like: `https://sondare.vercel.app/support.html`

Then update App Store Connect with the new Vercel URL.

**Advantages of Vercel:**
- Works with private repositories
- Faster deployment (30 seconds vs 5 minutes)
- Automatic SSL
- Better performance
- Automatic deployments on every commit

## Troubleshooting Checklist

Go through this checklist if your GitHub Pages isn't working:

- [ ] Repository name is exactly "Sondare" (case-sensitive)
- [ ] Repository is public (or you have GitHub Pro)
- [ ] GitHub Pages is enabled in Settings → Pages
- [ ] Source is set to "Deploy from a branch"
- [ ] Branch is set to "main" or "master"
- [ ] Folder is set to "/docs"
- [ ] All HTML files exist in the docs folder
- [ ] Files are committed and pushed to the main branch
- [ ] Waited at least 5 minutes after pushing
- [ ] Checked Actions tab for successful deployment
- [ ] Tested the full URL in an incognito window

## Need Help?

If you're still having issues:

1. Check the **Actions** tab for specific error messages
2. Share the error message from the failed deployment
3. Verify your repository URL and settings
4. Consider using Vercel as an alternative (easier setup)

## Quick Status Check

Run this mental checklist:

1. **Is your repository public?** → Check Settings
2. **Is GitHub Pages enabled?** → Check Settings → Pages
3. **Do you see a green checkmark in Actions?** → Check Actions tab
4. **Can you access the main page?** → Try the URL in incognito mode

If YES to all four, your GitHub Pages is working correctly!
