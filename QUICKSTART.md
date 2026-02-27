# Quick Start Guide ⚡

Get your Shopify Parcel Tracker live in 5 minutes.

## Step 1: Clone & Setup (1 min)

```bash
# Clone your repo
git clone https://github.com/yourusername/shopify-parcel-tracker
cd shopify-parcel-tracker

# Install dependencies
npm install
```

## Step 2: Test Locally (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

✅ Try entering a tracking number to verify it works

## Step 3: Deploy to Vercel (2 min)

### Option A: Web UI (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repo
4. Click "Deploy"
5. Done! 🎉

### Option B: CLI

```bash
npm install -g vercel
vercel --prod
```

## Step 4: Get Your Public URL

After deployment, Vercel gives you a URL:
```
https://shopify-parcel-tracker.vercel.app
```

(Or your custom domain if configured)

## Step 5: Add to Shopify (1 min)

Add this to your Shopify theme's `order.liquid` file:

```html
<div style="max-width: 700px; margin: 30px auto;">
  <iframe 
    src="https://shopify-parcel-tracker.vercel.app" 
    style="width: 100%; height: 700px; border: none; border-radius: 8px;">
  </iframe>
</div>
```

---

## Test It Works

1. Go to your Shopify store
2. Create a test order (or use an existing one with tracking)
3. Visit the order tracking page
4. You should see your parcel tracker widget
5. Enter a tracking number to verify

---

## Next Steps

- 📖 Read [README.md](./README.md) for more details
- 🔧 Check [INTEGRATION.md](./INTEGRATION.md) for advanced integrations
- 📋 See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options

---

## Common Issues

**"Tracking not found"**
- Make sure the tracking number exists on parcelsapp.com
- Try the number directly on parcelsapp.com to verify

**"iFrame not loading"**
- Check your Shopify theme allows iFrames
- Try the URL directly in your browser
- Check browser console for errors

**"Slow response"**
- First request takes 500-1500ms (normal - it scrapes the page)
- Subsequent requests are faster

---

## That's It! 🚀

Your Shopify Parcel Tracker is now live.

**Questions?** Check the other documentation files or open a GitHub issue.
