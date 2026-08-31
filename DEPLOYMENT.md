# AYUTH - Deployment Guide

Step-by-step instructions for deploying AYUTH to production.

## Prerequisites
- All AYUTH files (index.html, styles.css, app.js, i18n.js, knowledge-base.js, README.md)
- A GitHub account (for most options)
- ~5 minutes

## Option 1: GitHub Pages (Recommended, Free, Easiest)

### Step 1: Create Repository
1. Go to [github.com](https://github.com)
2. Click **New Repository**
3. Name it: `yourusername.github.io` (exactly this format)
4. Make it **Public**
5. Click **Create**

### Step 2: Upload Files
**Via GitHub Web UI** (easiest):
1. Click **Add files** → **Upload files**
2. Drag and drop all AYUTH files
3. Commit with message: "Initial commit: AYUTH app"

**Via Git (command line)**:
```bash
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io
cp /path/to/ayuth/files/* .
git add .
git commit -m "Initial commit: AYUTH app"
git push origin main
```

### Step 3: Access Your Site
Visit: `https://yourusername.github.io`

Done! 🎉

### Updating
Just push new changes:
```bash
git add .
git commit -m "Update: [description]"
git push origin main
```

---

## Option 2: Netlify (Free, Recommended for Beginners)

### Step 1: Sign Up
1. Go to [netlify.com](https://www.netlify.com)
2. Click **Sign Up** → GitHub
3. Authorize Netlify to access your GitHub

### Step 2: Deploy
1. Click **Add new site**
2. Choose **Deploy manually**
3. Drag and drop the project folder
4. Click **Deploy site**

Netlify generates a random URL (e.g., `peaceful-badger-123.netlify.app`)

### Step 3: Custom Domain (Optional)
1. In Netlify dashboard, go to **Domain settings**
2. Add your custom domain
3. Follow DNS setup instructions

---

## Option 3: Vercel (Free, Recommended for Developers)

### Step 1: Sign Up
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → GitHub
3. Authorize Vercel

### Step 2: Deploy
1. Click **New Project**
2. Import your GitHub repository (if you uploaded to GitHub)
   OR click **Deploy manually** and drag-drop your folder
3. Click **Deploy**

Vercel provides a URL (e.g., `ayuth.vercel.app`)

---

## Option 4: AWS S3 + CloudFront (For Scale, ~$1–5/month)

### Step 1: Create S3 Bucket
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Search for **S3** → Click **Create bucket**
3. Name: `ayuth-app` (or any unique name)
4. Region: Closest to you
5. Uncheck **Block public access** (for hosting)
6. Click **Create**

### Step 2: Upload Files
1. Go to bucket → **Upload**
2. Upload all AYUTH files
3. Select all files → **Actions** → **Make public**

### Step 3: Enable Static Hosting
1. Go to bucket → **Properties**
2. Scroll to **Static website hosting** → **Edit**
3. Enable it
4. Index document: `index.html`
5. Click **Save**

Your site is now live at: `http://ayuth-app.s3-website-[region].amazonaws.com`

### Step 4: CloudFront (Optional, Faster)
1. Search **CloudFront** in AWS Console
2. Create distribution
3. Origin: Your S3 bucket URL
4. Default root object: `index.html`
5. Create

Now access via CloudFront URL (faster, global CDN)

---

## Option 5: Docker (For Advanced Users)

### Create Dockerfile
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run
```bash
docker build -t ayuth:latest .
docker run -p 80:80 ayuth:latest
```

Visit: `http://localhost`

---

## Option 6: Your Own Server (VPS)

### Prerequisites
- VPS with Ubuntu/Debian
- SSH access
- nginx or Apache installed

### Setup
```bash
# SSH into server
ssh root@your-vps-ip

# Create web directory
mkdir -p /var/www/ayuth

# Upload files (from your computer)
scp -r /path/to/ayuth/* root@your-vps-ip:/var/www/ayuth/

# Configure nginx
sudo nano /etc/nginx/sites-available/ayuth
```

### nginx Config
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/ayuth;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /index.html;
}
```

### Enable & Start
```bash
sudo ln -s /etc/nginx/sites-available/ayuth /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

Visit: `http://yourdomain.com`

---

## Adding a Custom Domain (All Options)

### GitHub Pages
1. In repo settings → **Pages**
2. Enter your domain
3. Update DNS records (see GitHub instructions)

### Netlify
1. In site settings → **Domain settings**
2. Add custom domain
3. Follow Netlify DNS setup

### Vercel
1. In project settings → **Domains**
2. Add domain
3. Follow Vercel DNS setup

---

## SSL/HTTPS (Highly Recommended)

### GitHub Pages
✅ Automatic HTTPS via GitHub

### Netlify
✅ Automatic free SSL

### Vercel
✅ Automatic free SSL

### AWS S3 + CloudFront
Use **Let's Encrypt** or AWS Certificate Manager (free)

### Your Own Server
```bash
# Use Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Monitoring & Maintenance

### Analytics (Optional)
Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Updates
1. Make changes locally
2. Test in browser
3. Commit and push (GitHub) or re-upload (Netlify/Vercel)
4. Changes live in 1–5 minutes

### Backup
```bash
# On your computer
git clone https://github.com/yourusername/yourusername.github.io.git ayuth-backup
# Or sync locally with FTP/SFTP
```

---

## Troubleshooting Deployment

### Issue: Site shows 404
- **GitHub Pages**: Check repo name is `yourusername.github.io`
- **Netlify/Vercel**: Ensure `index.html` is in root directory
- **S3**: Check bucket static hosting is enabled

### Issue: Styles/JS not loading
- **Cause**: File paths are incorrect
- **Fix**: Ensure all files (HTML, CSS, JS) are in same directory

### Issue: API key exposed
- **Fix**: API key should NOT be in code. Users paste it in Settings.
- Test with incognito window to verify no key in localStorage

### Issue: Chat not working
- **Cause**: Gemini API key invalid or quota exceeded
- **Fix**: Check API key, test in [Google AI Studio](https://aistudio.google.com)
- Fall back to Offline mode

---

## Performance Tips

- Enable CDN (Netlify, Vercel, CloudFront) for faster delivery
- Minify CSS/JS (optional; current files are already lean)
- Add caching headers (nginx: `expires 30d;`)
- Monitor with browser DevTools → Network tab

---

## Security Checklist

- ✅ API key stored in session memory, NOT localStorage
- ✅ No API key in any file or git history
- ✅ HTTPS enabled on production
- ✅ Content Security Policy (CSP) headers (optional, advanced)
- ✅ No user data stored on server
- ✅ No third-party trackers (except Google Analytics, optional)

---

## Deployment Comparison

| Platform | Cost | Ease | Features | HTTPS |
|----------|------|------|----------|-------|
| **GitHub Pages** | Free | ⭐⭐ | Basic | ✅ |
| **Netlify** | Free | ⭐⭐⭐ | Analytics, forms | ✅ |
| **Vercel** | Free | ⭐⭐⭐ | Analytics, preview | ✅ |
| **AWS S3** | ~$1/mo | ⭐⭐ | Scalable | Manual |
| **VPS** | $5+/mo | ⭐ | Full control | Manual |
| **Docker** | $5+/mo | ⭐ | Containerized | Manual |

**Recommendation for beginners**: Start with **GitHub Pages** or **Netlify**. They're free, fast, and require zero configuration.

---

For any deployment issues, check the full README.md or contact your hosting provider's support.

Happy deploying! 🚀
