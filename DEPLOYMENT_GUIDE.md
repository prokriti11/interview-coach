# 🚀 Deployment Guide for Netlify

Follow these simple steps to deploy your AI Interview Coach to Netlify!

## 📦 What You Have

Your project structure:
```
interview-coach-deploy/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          (Your main app)
│   ├── index.js
│   └── index.css
├── package.json
├── netlify.toml
├── .gitignore
└── README.md
```

## 🎯 EASIEST METHOD: Drag & Drop Deploy

### Step 1: Install Dependencies & Build
1. Open terminal/command prompt
2. Navigate to the `interview-coach-deploy` folder
3. Run these commands:
```bash
npm install
npm run build
```
This creates a `build` folder with your production files.

### Step 2: Deploy to Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up for free (use GitHub/Google/Email)
3. You'll see "Want to deploy a new site without connecting to Git?"
4. **Drag the `build` folder** onto the drag & drop area
5. Wait 30 seconds... **Done!** 🎉

### Step 3: Get Your Live URL
- Netlify gives you a URL like: `random-name-123.netlify.app`
- Click "Domain Settings" to change to a custom name like `ai-interview-coach.netlify.app`

---

## 🔄 ALTERNATIVE: GitHub Deploy (Auto-updates)

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. In your terminal:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub
4. Select your repository
5. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
6. Click "Deploy site"

Now every time you push to GitHub, Netlify automatically redeploys! 🚀

---

## ⚙️ ADVANCED: Netlify CLI

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```

### Step 3: Deploy
```bash
# Test deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

---

## ⚠️ Important Notes

### API Key Security
The app currently uses Anthropic's API directly from the browser. For production:

**Option A: Use Netlify Functions (Recommended)**
1. Create `netlify/functions/api.js`
2. Move API calls to serverless function
3. Store API key in Netlify environment variables

**Option B: Limited Demo Mode**
- Keep current setup for demo purposes only
- Be aware of API key exposure in browser
- Monitor usage to avoid unexpected charges

### Browser Permissions
The voice recording feature requires:
- Microphone permission (browser will ask user)
- HTTPS connection (Netlify provides this automatically)

---

## 🎨 Customization After Deploy

### Change Site Name
1. Go to Site Settings → Domain Management
2. Click "Options" → "Edit site name"
3. Choose available name: `your-name.netlify.app`

### Custom Domain
1. Buy domain from Namecheap/Google Domains
2. In Netlify: Site Settings → Domain Management → Add custom domain
3. Follow DNS setup instructions

### Environment Variables
1. Site Settings → Environment Variables
2. Add `REACT_APP_ANTHROPIC_API_KEY`
3. Redeploy to apply changes

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Module not found" Error
- Make sure all dependencies are in `package.json`
- Run `npm install` again

### Voice Recording Not Working
- Must be on HTTPS (Netlify provides this)
- User must grant microphone permission
- Check browser compatibility (Chrome/Edge work best)

---

## 📊 What Happens After Deploy

✅ Live URL at `yoursite.netlify.app`
✅ HTTPS enabled automatically
✅ Free hosting (100GB bandwidth/month)
✅ Continuous deployment (if using Git)
✅ Instant cache invalidation
✅ Global CDN distribution

---

## 🎉 You're Done!

Share your app:
- Tweet: "Just built an AI Interview Coach with voice recording! 🎯"
- LinkedIn: Add to portfolio
- GitHub: Star your repo
- Reddit: Share in r/webdev

**Your live app:** `https://your-site.netlify.app`

Need help? Check [Netlify Docs](https://docs.netlify.com) or the community forum!
