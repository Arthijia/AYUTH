# AYUTH - Architecture & Developer Guide

Technical documentation for extending and customizing AYUTH.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AYUTH Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Browser (Frontend Only)                     │  │
│  │                                                          │  │
│  │  ┌─────────────┬─────────────┬──────────────────────┐   │  │
│  │  │ index.html  │ styles.css  │ JavaScript Files    │   │  │
│  │  │ (UI)        │ (Design)    │ ├─ app.js           │   │  │
│  │  │             │             │ ├─ i18n.js          │   │  │
│  │  │             │             │ └─ knowledge-base.js│   │  │
│  │  └─────────────┴─────────────┴──────────────────────┘   │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Browser Storage (localStorage)           │   │  │
│  │  │  • Invention Profile                            │   │  │
│  │  │  • Chat History                                 │   │  │
│  │  │  • Settings (Jurisdiction, Model)               │   │  │
│  │  │  • Language Preference                          │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              External APIs (Optional)                    │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Google Generative AI (Gemini API)              │   │  │
│  │  │  ├─ Input: System prompt + conversation         │   │  │
│  │  │  ├─ Processing: AI inference                    │   │  │
│  │  │  └─ Output: Text response                       │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                   (Optional, Live Mode Only)            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Key Principle: 100% static frontend. No backend server required.
```

---

## File Structure & Responsibilities

### `index.html` (UI Structure)
- **Size**: ~8 KB
- **Purpose**: Complete UI markup with all features
- **Key Sections**:
  - Header (logo, language selector, settings/info buttons)
  - Sidebar (navigation, session info)
  - Content area (chat, classifier, locker, KB tabs)
  - Modals (settings, info)
- **No logic**: Just HTML structure

### `styles.css` (Design System)
- **Size**: ~15 KB
- **Purpose**: Professional, responsive styling
- **Key Features**:
  - CSS variables for colors, spacing, typography
  - Dark green/gold/cream color palette
  - Responsive breakpoints (desktop, tablet, mobile)
  - Smooth animations and transitions
- **How to Customize**:
  ```css
  :root {
    --color-primary-dark: #1B4332;    /* Modify colors here */
    --color-accent-gold: #D4A574;
    --color-accent-cream: #F5F3EE;
    /* ... etc */
  }
  ```

### `app.js` (Core Logic)
- **Size**: ~12 KB
- **Purpose**: Main application logic
- **Key Functions**:
  - **Chat**: `sendMessage()`, `getAIResponse()`, `callGeminiAPI()`, `getOfflineResponse()`
  - **Profile**: `saveInventionProfile()`, `displayInventionProfileSummary()`
  - **Locker**: `generateInventionHash()`, `copyHashToClipboard()`
  - **Settings**: `openSettings()`, `updateAPIStatus()`, `clearSession()`
  - **Navigation**: `switchTab()`, `updateSessionInfo()`
- **State Management**: `appState` global object
  ```javascript
  let appState = {
    jurisdiction: "india",           // or "international"
    apiKey: null,                    // User's Gemini API key
    apiModel: "gemini-1.5-pro",     // Selected model
    inventionProfile: {...},         // User's answers
    conversationHistory: [...]       // Chat messages
  };
  ```

### `i18n.js` (Internationalization)
- **Size**: ~8 KB
- **Purpose**: Multi-language support
- **Current Languages**: English (en), Hindi (hi), Kannada (kn)
- **How It Works**:
  ```javascript
  const translations = {
    en: { key: "English text" },
    hi: { key: "हिन्दी टेक्स्ट" },
    kn: { key: "ಕನ್ನಡ ಪಠ್ಯ" }
  };
  
  // Usage
  t("keyName")  // Returns translated text
  ```
- **Adding Language**:
  1. Add new language object to `translations`
  2. Add language option to HTML `<select id="languageSelect">`
  3. Add all keys with translations

### `knowledge-base.js` (Offline Q&A)
- **Size**: ~20 KB
- **Purpose**: Offline knowledge base with 15+ Q&A entries
- **Structure**:
  ```javascript
  const knowledgeBase = [
    {
      id: "unique-id",
      category: "Patent Eligibility",
      question: "...",
      answer: "...",
      citation: "...",
      jurisdiction: ["india", "international"]
    },
    // ... more entries
  ];
  ```
- **Key Functions**:
  - `renderKnowledgeBase()`: Display KB items
  - `toggleKBItem()`: Expand/collapse Q&A
  - `filterKnowledgeBase()`: Search KB

---

## State Management

### Where Data is Stored

**Browser localStorage** (persists across sessions):
```javascript
{
  "ayuthProfile": {...},           // Invention profile (JSON)
  "ayuthChat": [...],              // Chat history (JSON)
  "ayuthJurisdiction": "india",    // Selected jurisdiction
  "ayuthModel": "gemini-1.5-pro",  // Selected model
  "ayuthLanguage": "en"            // Selected language
}
```

**Session memory** (cleared on browser close):
```javascript
appState.apiKey  // User's Gemini API key (NOT stored in localStorage)
```

**Why not store API key in localStorage?**
- Risk: If localStorage is exposed, API key is compromised
- Solution: Keep in session memory only (cleared on browser close)
- Trade-off: Users must re-enter API key when reopening browser

---

## API Integration

### Gemini API Flow

```
User Message
    ↓
app.js: sendMessage()
    ↓
checkAPIKey() ? callGeminiAPI() : getOfflineResponse()
    ↓
[Live Mode]              [Offline Mode]
callGeminiAPI()          getOfflineResponse()
  ↓                        ↓
Build prompt          Search KB for matches
  ↓                        ↓
Send to Google        Return best match +
  ↓                     disclaimer
Parse response
  ↓
addMessageToChat()
  ↓
Display with
citations & alerts
```

### Switching to Another AI Provider

To use OpenAI, Anthropic, or others, modify `callGeminiAPI()` in `app.js`:

```javascript
async function callGeminiAPI(userMessage) {
  // Replace this entire function with your provider's code
  // Example: OpenAI API
  
  const response = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${appState.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: appState.apiModel,
        messages: buildMessages(),
        temperature: 0.7
      })
    }
  );
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## Extending Features

### Adding a New Tab

1. **Add HTML in `index.html`**:
   ```html
   <div id="newTab" class="tab-content hidden">
     <div class="new-container">
       <!-- Your content -->
     </div>
   </div>
   ```

2. **Add Sidebar Button**:
   ```html
   <button class="nav-btn" data-tab="newTab" onclick="switchTab('newTab')">
     <span class="nav-icon">🆕</span>
     <span>New Feature</span>
   </button>
   ```

3. **Add CSS in `styles.css`**:
   ```css
   .new-container {
     max-width: 900px;
     margin: 0 auto;
   }
   ```

4. **Add Logic in `app.js`**:
   ```javascript
   function setupNewFeature() {
     // Your logic here
   }
   
   // Call in initializeApp()
   ```

### Adding Risk Alerts

Modify `parseMessageForAlerts()` in `app.js`:

```javascript
const alerts = [
  {
    pattern: /your-keyword/gi,
    type: "alert-type",
    title: "Alert Title",
    message: "Alert message here"
  }
];
```

### Adding Q&A to Knowledge Base

Edit `knowledge-base.js`:

```javascript
{
  id: "your-unique-id",
  category: "Your Category",
  question: "Your question?",
  answer: "Your comprehensive answer here. Be detailed and cite sources.",
  citation: "Source — Section, Year",
  jurisdiction: ["india", "international"]
}
```

---

## Performance Optimization

### Current Metrics
- **HTML**: ~8 KB
- **CSS**: ~15 KB
- **JS (total)**: ~40 KB
- **Page load**: <1 second
- **API response**: 2–5 seconds
- **Total**: ~63 KB (uncompressed)

### Optimization Tips
1. **Minify CSS/JS** (if deploying at scale):
   ```bash
   # Using cssnano and terser
   npx cssnano styles.css -o styles.min.css
   npx terser app.js -o app.min.js
   ```

2. **Enable Gzip** (on hosting):
   - GitHub Pages: Automatic
   - Netlify: Automatic
   - Vercel: Automatic

3. **Cache Static Files** (nginx):
   ```nginx
   expires 30d;
   add_header Cache-Control "public, immutable";
   ```

4. **Lazy Load** (if adding more Q&A):
   Load KB only when user clicks KB tab

---

## Testing

### Manual Testing Checklist

- [ ] **Desktop**: Chat, profile, locker, KB all work
- [ ] **Tablet**: Responsive layout, no overflow
- [ ] **Mobile**: Touch-friendly, readable text
- [ ] **API**: Live mode with valid key
- [ ] **Offline**: KB works without API key
- [ ] **Languages**: EN/HI/KN all display correctly
- [ ] **Storage**: Profile persists after reload
- [ ] **Security**: API key NOT in localStorage

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Mobile)

---

## Debugging Tips

### Browser Console Errors?

1. **Open DevTools** (F12 or Cmd+Opt+I)
2. **Check Console tab** for error messages
3. **Check Network tab** for failed API calls
4. **Check Application tab** for localStorage contents

### Chat Not Responding?

1. Check if API key is valid
2. Test API key in [Google AI Studio](https://aistudio.google.com)
3. Check browser console for fetch errors
4. Fall back to Offline mode

### Profile Not Saving?

1. Check if localStorage is enabled
2. Check if not in private/incognito mode
3. Check Application → LocalStorage in DevTools
4. Manually clear localStorage and try again

### Language Not Switching?

1. Hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
2. Check localStorage for correct language key
3. Check if translations are defined for that language

---

## Security Considerations

### API Key Security
- ✅ Stored in session memory only (not localStorage)
- ✅ Never logged to console
- ✅ Sent only to Google's official API endpoints
- ✅ User can revoke anytime in settings

### Data Privacy
- ✅ No backend server (no data collected)
- ✅ Invention profiles stay in user's browser
- ✅ Chat history never sent to external servers
- ✅ No cookies or tracking (except optional Google Analytics)

### Best Practices
- Rotate API keys every 3 months
- Use API key restrictions (limit to specific IPs if on paid plan)
- Monitor API usage in Google Cloud Console
- Don't commit API keys to git (use `.gitignore`)

---

## Future Enhancement Ideas

### Short Term
- [ ] Export chat as PDF
- [ ] Copy individual messages
- [ ] Adjust AI temperature/creativity
- [ ] More Q&A entries (expand to 25+)

### Medium Term
- [ ] Patent drafting assistant
- [ ] TKDL database integration (real-time search)
- [ ] Voice input/output
- [ ] Dark/light mode toggle

### Long Term
- [ ] Collaborative team profiles
- [ ] Integrated IP calendar (filing deadlines)
- [ ] Patent similarity checker
- [ ] Self-hosted backend option (for enterprise)

---

## Deployment Checklist

Before going live:

- [ ] API key NOT hardcoded anywhere
- [ ] `.gitignore` includes `*.key`, `*.pem`, `.env`
- [ ] Knowledge base Q&A all have citations
- [ ] All disclaimers present
- [ ] Tested on mobile devices
- [ ] Chat works offline (KB fallback)
- [ ] All 3 languages working
- [ ] Settings panel functional
- [ ] Invention Locker hashing works
- [ ] README and QUICK_START complete

---

## Support & Contribution

### Reporting Bugs
- Provide browser + version
- Include console error messages
- Describe steps to reproduce
- Share screenshot if UI-related

### Contributing Enhancements
1. Fork the repository
2. Create feature branch (`git checkout -b feature/my-feature`)
3. Make changes
4. Test thoroughly
5. Submit pull request with description

### Adding Translations
- Edit `i18n.js`
- Add complete translations for all keys
- Test UI in new language
- Submit PR

---

## License & Attribution

AYUTH is provided as-is for educational and professional use. Feel free to fork, modify, and adapt for your needs.

---

**Last Updated**: August 2026  
**For Questions**: See README.md and QUICK_START.md

Happy coding! 🚀
