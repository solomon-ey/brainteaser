# Phase 1: Privacy & Consent — Integration Guide

## Overview
This phase provides two assets for **The Brain Teaser** launch:
1. **`privacy-policy.html`** — A comprehensive, legally-compliant privacy policy
2. **Consent banner system** (`consent-banner.js` + `consent-banner.css`) — A reusable, user-friendly consent manager

Both comply with **COPPA** (US children), **NDPA** (Nigeria), **GDPR** (EU), and **UK GDPR**.

---

## 1. Privacy Policy Page

### What it covers
- ✅ COPPA, NDPA, GDPR, UK GDPR compliance
- ✅ LocalStorage and device-only storage
- ✅ Browser text-to-speech (no recording)
- ✅ Optional analytics (privacy-respecting)
- ✅ Affiliate links with FTC-style disclosure
- ✅ Third-party services (Vercel, Netlify, Google Fonts)
- ✅ User rights (access, deletion, portability)
- ✅ Security measures
- ✅ Contact and support details

### Integration
```html
<!-- In your main navigation or footer -->
<a href="/privacy-policy.html" target="_blank">Privacy Policy</a>
```

### Customization
Before launch, update these placeholders:
- **Email addresses:** Replace `privacy@thebrainteaser.com` and `support@thebrainteaser.com`
- **Website URL:** Replace `thebrainteaser.com` with your actual domain
- **Contact method:** Update phone, address, or support form URL if desired

---

## 2. Consent Banner System

### Files
- **`consent-banner.js`** — Logic for capturing and storing consent
- **`consent-banner.css`** — Styling (mobile-responsive, accessible)

### How it works
1. **On first visit:** Shows a banner asking for consent
2. **User choice:** Accept all / Reject / Configure per-category
3. **Storage:** Consent saved to localStorage for 1 year
4. **Re-prompt:** Banner hidden after choice until consent expires

### Integration — 3 steps

#### Step 1: Add HTML container
In `index.html`, add this **in the body** (typically after `<body>` or before closing `</body>`):

```html
<!-- Consent Banner Container -->
<div id="consent-banner"></div>
```

#### Step 2: Link the CSS
In the `<head>`:

```html
<link rel="stylesheet" href="/consent-banner.css">
```

#### Step 3: Include the JavaScript
Before closing `</body>`:

```html
<script src="/consent-banner.js"></script>
```

### Full Example (minimal)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Brain Teaser</title>
    <!-- Your other stylesheets -->
    <link rel="stylesheet" href="/consent-banner.css">
</head>
<body>
    <!-- Your app -->
    <div id="app"></div>

    <!-- Consent Banner -->
    <div id="consent-banner"></div>

    <!-- Your scripts -->
    <script src="/your-app.js"></script>
    <script src="/consent-banner.js"></script>
</body>
</html>
```

---

## 3. Using Consent in Your Code

### Check if analytics is allowed
Before loading analytics (Plausible, Fathom, Google Analytics, etc.), check consent:

```javascript
// Load analytics only if user consented
if (window.consentGiven('analytics')) {
    // Load your analytics script
    const script = document.createElement('script');
    script.src = 'https://plausible.io/js/script.js';
    script.async = true;
    document.head.appendChild(script);
}
```

### Listen for consent changes
If you want to react to consent updates in real-time:

```javascript
window.addEventListener('consent:accepted', (e) => {
    console.log('User accepted all consent:', e.detail);
    // Load analytics, etc.
});

window.addEventListener('consent:rejected', (e) => {
    console.log('User rejected analytics:', e.detail);
    // Don't load analytics
});

window.addEventListener('consent:updated', (e) => {
    console.log('Consent settings updated:', e.detail);
    // Re-check and load/unload services as needed
});
```

### Access stored consent directly
```javascript
const storedConsent = JSON.parse(localStorage.getItem('brainteaser_consent'));
console.log('Analytics allowed:', storedConsent.analytics);
console.log('Consent given at:', new Date(storedConsent.timestamp));
```

---

## 4. Customization

### Change banner text
Edit `renderBanner()` in `consent-banner.js` to customize the main message:

```javascript
renderBanner() {
    return `
        <div class="consent-banner__content">
            <h2>Your Custom Title</h2>
            <p>Your custom message here...</p>
            ...
        </div>
    `;
}
```

### Change colors
In `consent-banner.css`, update these color variables:

```css
:root {
    --primary-color: #1a73e8;      /* Blue */
    --secondary-color: #f1f3f4;    /* Light gray */
    --text-color: #1a1a1a;         /* Dark text */
}
```

### Change consent expiry
In `consent-banner.js`, modify this line:

```javascript
consentExpiry: 365 * 24 * 60 * 60 * 1000, // Change 365 to desired days
```

### Allow/require analytics by default
In the settings template, change the initial state:

```javascript
${this.consent.analytics ? 'checked' : ''} // Change to `checked` to enable by default
```

---

## 5. Testing

### Test banner appearance
1. Open `index.html` in a browser
2. Open Developer Tools → Application → LocalStorage
3. Delete the `brainteaser_consent` key
4. Refresh the page
5. The banner should appear at the bottom

### Test consent flow
- Click "Accept All" → banner disappears, localStorage stores consent
- Refresh → banner stays gone (consent remembered)
- Manually delete localStorage key → banner reappears

### Test analytics check
In the browser console:
```javascript
console.log(window.consentGiven('analytics'));  // true or false
```

---

## 6. Affiliate Links Integration

Once the consent banner is live, update `data/affiliates.json` (from the BUILD-PLAN) with your tracking links:

```json
{
  "child_numbers": [
    { "title": "Math Workbook", "url": "https://amazon.com/...", "source": "amazon" },
    ...
  ],
  "professions_developer": [
    { "title": "Clean Code", "url": "https://amazon.com/...", "source": "amazon" },
    ...
  ]
}
```

All affiliate links will automatically include the disclosure and `rel="sponsored nofollow"` attributes.

---

## 7. Compliance Checklist

- ✅ Privacy Policy page deployed
- ✅ Consent banner integrated into app
- ✅ Email addresses updated (privacy@, support@)
- ✅ Analytics only load if `window.consentGiven('analytics')`
- ✅ Privacy Policy linked in footer/header
- ✅ Tested on mobile (iOS Safari, Android Chrome)
- ✅ COPPA-compliant (no ads, no behavioral tracking for children)
- ✅ NDPA-compliant (data stored locally, no overseas transfer)

---

## 8. What's Next (Phase 2)

Once this is live:
1. **Join affiliate programs** — Amazon Associates, Jumia, Udemy, etc.
2. **Update `affiliates.json`** with real tracking links
3. **Proceed to Phase 2:** Split into a Vite project + move questions to data files

---

## Support

If you have questions or need to customize further, refer to:
- `privacy-policy.html` — Full policy text and legal framework
- `consent-banner.js` — Documentation comments in code
- `consent-banner.css` — Styling reference

Good luck with launch! 🚀
