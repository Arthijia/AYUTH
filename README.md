# AYUTH - IP-SAKTI Sahayak

**A complete, interactive AI-powered assistant providing IP and regulatory guidance for Ayurvedic inventions.**

## Overview

AYUTH is a single-page web application designed to help Ayurvedic innovators, researchers, and entrepreneurs navigate the complex landscape of intellectual property (IP) protection and regulatory compliance in India and internationally. It combines real-time AI-powered guidance with a robust offline knowledge base, multi-language support, and production-quality code.

### What AYUTH Does

AYUTH answers questions **strictly about**:
- **Patent Eligibility & Inventive Step**: Assessing patentability of Ayurvedic formulations and processes
- **Traditional Knowledge (TKDL) Overlaps**: Identifying risks of overlap with documented traditional knowledge
- **Biological Resource Regulations**: Ensuring compliance with biopiracy and benefit-sharing laws
- **Trademark Strategy**: Distinguishing between trademark, patent, and other IP protections
- **Geographical Indications (GI)**: Protecting region-specific Ayurvedic products
- **AYUSH Manufacturing Licenses**: Regulatory compliance and approvals
- **International IP Filing**: Routes via WIPO, PCT, and other frameworks

### What AYUTH Does NOT Do

AYUTH **explicitly refuses** to provide:
- Medical or treatment advice
- Clinical efficacy claims
- Therapeutic guidance
- Diagnostic information

If you ask AYUTH about treatment outcomes or medical applications, it will clearly redirect you to consult qualified healthcare providers.

---

## Features

### 1. **Jurisdiction Toggle**
Switch between:
- **India Only**: Focuses on Indian IP law (Patents Act 1970, Trade Marks Act 1999, Biological Diversity Act 1992)
- **International Regimes**: Covers WIPO, PCT, CBD, Nagoya Protocol, and global IP frameworks

The scope is dynamically updated in all responses.

### 2. **5-Question Invention Classifier**
Build a persistent **Invention Profile** by answering:
1. What is your invention? (description)
2. What problem does it solve?
3. What is technically novel about it?
4. Has it been publicly disclosed? (yes/no/limited)
5. Does it use biological resources or traditional knowledge?

Your profile is stored locally and included in every AI-powered response for tailored guidance.

### 3. **Chat Interface with AI & Offline Modes**
- **Live AI Mode**: Connect your Gemini API key for real-time AI guidance powered by Google's Gemini model
- **Offline Mode**: Falls back to a curated knowledge base of 15+ Q&A entries covering all major IP topics
- **Conversation Memory**: Chat history persists in your browser for reference
- **Citations**: Every substantive answer includes legal citations (e.g., "Patents Act, 1970 — Section 3(d)")

### 4. **Invention Locker**
Client-side proof-of-conception tool:
- Paste your invention description
- Generates SHA-256 hash + timestamp
- Receipt displayed for screenshot/saving as informal evidence
- **100% private**: No data uploaded or transmitted to any server

### 5. **Risk Alerts**
Inline warnings for high-risk situations:
- **TKDL Alert**: Detects traditional knowledge overlap language
- **Biopiracy Risk**: Flags biological resource and benefit-sharing concerns
- **Novelty Concern**: Highlights potential prior-art issues

### 6. **Offline Knowledge Base**
15 comprehensive Q&A entries covering:
- Patent novelty & inventive step
- TKDL overlap and traditional knowledge
- Biopiracy and biological resources
- Trademark vs. patent strategy
- Geographical Indications
- AYUSH licensing & regulatory compliance
- Process patents
- International filing routes
- And more...

Fully searchable and available without any API connection.

### 7. **Multi-Language Support**
UI and AI responses in:
- **English**
- **हिन्दी (Hindi)**
- **ಕನ್ನಡ (Kannada)**

Language selection is persisted in browser settings.

### 8. **API Key Management**
- Paste your Gemini API key in Settings (stored in session memory only, never sent to external servers)
- Status indicator shows "Connected" or "Offline Mode"
- Gracefully falls back to offline mode if API fails
- Model selection: Choose between Gemini Pro and Gemini 1.5 Pro

### 9. **Responsive Design**
- **Desktop**: Full sidebar navigation, expanded chat
- **Tablet**: Sidebar converts to tab navigation
- **Mobile**: Optimized single-column layout
- All features accessible on any device

---

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Live AI mode; offline mode works without internet)
- Gemini API key (optional; Offline mode works without it)

### Installation

#### Option 1: Local Setup (Recommended for Development)

1. **Clone or Download**:
   ```bash
   git clone <repository-url>
   cd ayuth2.0
   # Or download as ZIP and extract
   ```

2. **Run Locally**:
   No build step required! Simply open `index.html` in your browser:
   ```bash
   # macOS/Linux
   open index.html
   
   # Windows
   start index.html
   
   # Or drag-and-drop into browser
   ```

#### Option 2: Deploy to Static Hosting

**GitHub Pages** (free, easiest):
1. Create a GitHub repository named `yourusername.github.io`
2. Upload all files (`index.html`, `styles.css`, `app.js`, `i18n.js`, `knowledge-base.js`, `README.md`)
3. Access at `https://yourusername.github.io`

**Netlify** (free, recommended):
1. Go to [netlify.com](https://www.netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop the project folder
4. Your site is live at a random subdomain (or connect custom domain)

**Vercel** (free):
1. Go to [vercel.com](https://vercel.com)
2. Import the project folder
3. Click "Deploy"
4. Access your live URL

All options work with zero configuration—AYUTH is a pure static site.

---

## Getting Your Gemini API Key

AYUTH uses **Google's Gemini API** for Live AI mode. Here's how to set it up:

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a Project** → **New Project**
3. Name it "AYUTH" (or your choice)
4. Click **Create**

### Step 2: Enable the Gemini API
1. In the console, search for **"Generative Language API"**
2. Click on it and press **Enable**

### Step 3: Create an API Key
1. Go to **Credentials** (left sidebar)
2. Click **Create Credentials** → **API Key**
3. Copy the generated API key (looks like `AIza...`)
4. ⚠️ **Keep this private**—never commit it to public repositories

### Step 4: Paste into AYUTH
1. Open AYUTH in your browser
2. Click **⚙️ Settings** (top-right)
3. In the "API Configuration" section, paste your API key
4. Status should change to **"Connected (Live AI Mode)"**
5. Start asking questions!

### Pricing
- **Free tier**: 60 requests per minute (generous for personal use)
- **Paid tier** (optional): Available for higher usage
- See [Google AI pricing](https://ai.google.dev/pricing) for details

---

## Usage Guide

### Chat Tab
1. **Ask a Question**: Type any IP or regulatory question in the chat box
2. **View Response**: AYUTH provides a cited answer with risk flags if applicable
3. **Use Your Profile**: If you've built an invention profile, AYUTH references it automatically

**Example Questions**:
- "I have a novel Ashwagandha formulation with higher bioavailability. Is it patentable?"
- "What's the difference between a trademark and a patent for my Ayurvedic brand?"
- "How do I file a patent internationally for my invention?"
- "What's the TKDL and how does it affect my patent application?"

### Invention Profile Tab
1. **Fill the Form**: Answer all 5 questions about your invention
2. **Save**: Click "Save Profile"—it's stored locally in your browser
3. **View Summary**: Your profile appears below the form
4. **Reference**: AYUTH uses this profile in every response for tailored guidance

### Invention Locker Tab
1. **Paste Description**: Enter your full invention description (technical details, methodology, etc.)
2. **Generate Hash**: Click "Generate Hash & Timestamp"
3. **Save Receipt**: Screenshot or save the receipt (contains SHA-256 hash + timestamp)
4. **Keep Safe**: Use as informal proof-of-conception evidence
5. **Privacy**: Your text stays in your browser—nothing is uploaded

### Knowledge Base Tab
1. **Browse**: Scroll through 15+ Q&A entries on key IP topics
2. **Expand**: Click any question to reveal the answer and citations
3. **Search**: Use the search box to filter by keyword or category
4. **Read Offline**: Fully available without internet or API key

### Settings
1. **Jurisdiction**: Toggle between India-only and International regimes
2. **API Key**: Paste your Gemini API key to enable Live AI mode
3. **Model**: Choose AI model (Gemini Pro or Gemini 1.5 Pro)
4. **Clear Data**: Permanently delete your invention profile and chat history

---

## Frequently Asked Questions

### Q: Is my data safe?
**A**: Yes. AYUTH is a **static web app**—all data is stored locally in your browser (localStorage). No data is sent to AYUTH servers. Only your API key is sent to Google's Gemini API (if you connect it). We recommend revoking or rotating your API key periodically.

### Q: Do I need an API key to use AYUTH?
**A**: No. Offline mode works without an API key using the knowledge base. However, Live AI mode provides more detailed, conversational, and tailored responses.

### Q: Can I export my conversation history?
**A**: Currently, conversations are stored in browser localStorage. To save them, you can copy-paste from the chat, or we can add an export feature in future versions.

### Q: Is AYUTH a substitute for a patent attorney?
**A**: **No.** AYUTH provides **informational guidance only**. Always consult a registered patent attorney or IP counselor before filing patents, making regulatory submissions, or making critical business decisions. Legal advice requires professional expertise and knowledge of your specific circumstances.

### Q: How often is the knowledge base updated?
**A**: The knowledge base is manually curated and may require updates as laws change. We aim to update it quarterly. Check the README or in-app notices for update dates.

### Q: Can I use AYUTH for medical advice?
**A**: **Absolutely not.** AYUTH will refuse and redirect you. For health questions, consult a qualified healthcare provider or Ayurvedic physician.

### Q: What languages does AYUTH support?
**A**: Currently English, Hindi, and Kannada. More languages may be added in future versions.

---

## Technical Details

### Architecture
- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks required)
- **Storage**: Browser localStorage (ephemeral and local)
- **AI Backend**: Google Generative AI API (Gemini)
- **Fallback**: Offline knowledge base (JSON data)
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel, etc.)

### Files
- `index.html`: Main UI structure
- `styles.css`: Professional design system (dark green/gold/cream palette)
- `app.js`: Core logic (chat, settings, classifiers, API integration)
- `i18n.js`: Internationalization (multi-language support)
- `knowledge-base.js`: Offline Q&A database

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- Page load: <1 second (no external dependencies except Google Gemini API)
- Chat response: 2–5 seconds (API) or instant (offline)
- Mobile optimized: <50KB JavaScript (uncompressed)

---

## Customization & Extending

### Adding More Q&A to Knowledge Base
Edit `knowledge-base.js` and add to the `knowledgeBase` array:
```javascript
{
  id: "unique-id",
  category: "Patent Strategy",
  question: "Your question here?",
  answer: "Your detailed answer here.",
  citation: "Source reference here",
  jurisdiction: ["india", "international"]
}
```

### Changing the Color Scheme
Edit `styles.css` CSS variables (top of file):
```css
:root {
  --color-primary-dark: #1B4332;    /* Modify these */
  --color-accent-gold: #D4A574;
  --color-accent-cream: #F5F3EE;
  /* ... etc */
}
```

### Adding a New Language
Edit `i18n.js` and add translations:
```javascript
kn: {
  headerTitle: "AYUTH",
  // ... add all keys
}
```

### Switching to a Different AI Provider
Modify `callGeminiAPI()` in `app.js` to use OpenAI, Anthropic, or other APIs.

---

## Troubleshooting

### Issue: Chat not responding
- **Cause**: API key invalid or internet down
- **Fix**: Check API key in Settings, ensure internet connection, fall back to Offline mode

### Issue: Invention profile not saving
- **Cause**: Browser storage disabled or private mode
- **Fix**: Use normal browsing mode, check browser privacy settings

### Issue: Invention Locker hash not generating
- **Cause**: Browser doesn't support Web Crypto API
- **Fix**: Update your browser, or use a modern browser (Chrome, Firefox, Safari, Edge)

### Issue: Multi-language UI not switching
- **Cause**: Cache not cleared
- **Fix**: Hard-refresh browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

---

## Disclaimer

**IMPORTANT**: AYUTH is an informational tool and is NOT a substitute for professional legal advice. Always consult a registered patent attorney, IP counselor, or regulatory expert before:
- Filing any patent application
- Making regulatory submissions to AYUSH or other authorities
- Making business decisions based on IP strategy
- Disclosing your invention publicly

AYUTH maintainers are not liable for any consequences of decisions made based on this tool. Use at your own risk, and verify all guidance with qualified professionals.

---

## Privacy Policy

- **No data collection**: AYUTH does not collect, store, or transmit your data to any server
- **Local storage only**: Invention profiles and chat history are stored in your browser's localStorage
- **API key**: Your Gemini API key is stored in session memory (not localStorage) and sent **only** to Google's API servers
- **Third parties**: No data is shared with third parties except Google (for Gemini API)
- **Cookies**: AYUTH does not use cookies

---

## License

AYUTH is provided as-is for educational and professional use. Feel free to fork, modify, and deploy for your own use.

---

## Roadmap & Future Enhancements

- [ ] Export chat history as PDF
- [ ] Advanced IP risk assessment (ML-based TKDL matching)
- [ ] Integration with Indian Patent Office API
- [ ] Voice input/output
- [ ] Real-time TKDL database sync
- [ ] Collaborative teams (shared profiles)
- [ ] Patent drafting assistant
- [ ] Local deployment option (self-hosted backend)

---

## Support & Contact

For issues, feature requests, or feedback, please:
- Check the Troubleshooting section above
- Review the Knowledge Base for guidance
- If using an API key, test with the official [Google AI Studio](https://aistudio.google.com)

---

**Last Updated**: August 2026  
**Version**: 1.0  
**Status**: Production Ready

---

Enjoy using AYUTH for your IP guidance journey! 🚀
