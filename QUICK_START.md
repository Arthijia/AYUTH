# AYUTH - Quick Start Guide

Get AYUTH running in under 5 minutes.

## 1. Open the App (Instant)

No installation needed:
```bash
# Option A: Open in browser directly
# Windows: Double-click index.html
# macOS/Linux: Double-click index.html or run: open index.html

# Option B: Use a simple local server (recommended)
# Python 3:
python -m http.server 8000
# Then visit: http://localhost:8000

# Node.js:
npx http-server
# Then visit: http://localhost:8080
```

That's it! AYUTH is now running. You can use Offline Mode immediately.

## 2. Get Your Gemini API Key (Optional, ~2 minutes)

To enable Live AI mode:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Search for **"Generative Language API"** → Click **Enable**
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. In AYUTH, click **⚙️ Settings** → Paste your key → Done!

Status should show **"Connected (Live AI Mode)"**

**Free tier**: 60 requests/minute (generous for testing)

## 3. Build Your Invention Profile (Optional)

1. Click **📋 Invention Profile** (sidebar)
2. Answer 5 questions about your invention
3. Click **Save Profile**
4. AYUTH will reference this in every response

## 4. Ask Questions!

1. Click **💬 Chat** (sidebar)
2. Type your IP/regulatory question
3. Get instant guidance with citations

## 5. Try Offline Mode

Don't have an API key? No problem!

1. Go to **📚 Q&A Library** (sidebar)
2. Browse 15+ comprehensive Q&A entries
3. Or ask a question in Chat → uses offline knowledge base

## 6. Proof-of-Conception (Optional)

1. Click **🔒 Invention Locker** (sidebar)
2. Paste your invention description
3. Click **Generate Hash & Timestamp**
4. Screenshot the receipt as informal evidence
5. **100% private**: Nothing uploaded

## 7. Deploy Live (Optional, ~1 minute)

Want to share with others?

### GitHub Pages (Free)
```bash
# Create a repo: yourusername.github.io
# Upload all files
# Access: https://yourusername.github.io
```

### Netlify (Free)
```bash
# Visit: netlify.com
# Drag-drop your folder
# Get instant live URL
```

### Vercel (Free)
```bash
# Visit: vercel.com
# Import folder
# Deployed!
```

---

## Common Questions

**Q: Do I need an API key?**  
A: No. Offline mode works fine without it. API key gives you AI-powered responses.

**Q: Is my data safe?**  
A: Yes. Everything stays in your browser. API key is sent only to Google.

**Q: Can I modify AYUTH?**  
A: Yes! Edit `styles.css` for colors, `i18n.js` for languages, `knowledge-base.js` for Q&A.

**Q: Is it really free?**  
A: Yes, fully free to use and deploy. API costs are on Google's free tier.

---

For full documentation, see **README.md**.

Enjoy! 🚀
