# Deployment Guide

## Quick Deploy (2 minutes)

### Prerequisites
- GitHub account (for source control)
- Vercel account (free, takes 2 minutes to create)

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Shopify parcel tracker"
   git branch -M main
   git remote add origin https://github.com/yourusername/shopify-parcel-tracker
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repo `shopify-parcel-tracker`
   - Click "Deploy"
   - Done! Your app is live 🎉

3. **Your URL will be:**
   ```
   https://shopify-parcel-tracker.vercel.app
   ```

---

## Deploy with Vercel CLI

If you prefer the command line:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (will link to GitHub)
vercel

# 3. For production (after testing)
vercel --prod

# 4. Your URL
# https://shopify-parcel-tracker.vercel.app
```

---

## Deploy to Other Platforms

### Netlify

```bash
# 1. Connect GitHub repo at netlify.com
# 2. Build command: npm run build
# 3. Publish directory: .next
```

### Railway.app

```bash
# 1. Install Railway CLI
# 2. railway login
# 3. railway deploy
```

### Docker (Any Server)

```bash
# Build image
docker build -t parcel-tracker .

# Run container
docker run -p 3000:3000 parcel-tracker

# Visit http://localhost:3000
```

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Production Checklist

- [ ] Update `README.md` with your app URL
- [ ] Test tracking with real tracking numbers
- [ ] Test on mobile devices
- [ ] Verify API response times are acceptable
- [ ] Add custom domain (optional)
- [ ] Enable HTTPS (automatic on Vercel)

---

## Custom Domain

### On Vercel

1. Go to your Vercel dashboard
2. Select "shopify-parcel-tracker" project
3. Settings → Domains
4. Add your domain (e.g., `tracker.yourdomain.com`)
5. Follow DNS configuration instructions

---

## Monitoring & Logs

### View Logs on Vercel

```bash
vercel logs --follow
```

### Monitor Performance

Vercel dashboard shows:
- Response times
- Request counts
- Error rates
- Deployment history

---

## Troubleshooting

### "Build failed" error

Check:
- `npm run build` works locally
- `package.json` has all dependencies
- `.env` variables are set (if needed)

### App is slow

- First request takes 500-1500ms (scraping)
- Subsequent requests are faster
- Consider caching in future

### 404 Not Found

Make sure:
- `pages/index.tsx` exists
- `pages/api/tracking.ts` exists
- Vercel deployed successfully

---

## Cost

**Free tier includes:**
- ✅ 10,000,000 function invocations/month
- ✅ Unlimited bandwidthafter first 1,000GB
- ✅ Custom domains
- ✅ HTTPS
- ✅ Automatic deployments from GitHub

**At scale, estimated costs:**
- 100k requests/month = ~$10-15
- 1M requests/month = ~$50-75

---

## Next Steps

1. Deploy the app
2. Test with real tracking numbers
3. Integrate into your Shopify store
4. Monitor performance
5. Add features as needed

**Any issues?** Check logs or open a GitHub issue.
