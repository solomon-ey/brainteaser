/**
 * Consent Banner — Privacy & Analytics Consent Management
 * 
 * Usage:
 *   1. Add <div id="consent-banner"></div> to your HTML body
 *   2. Include this script: <script src="consent-banner.js"></script>
 *   3. Check consent before loading analytics: if (window.consentGiven('analytics')) { ... }
 * 
 * Stores consent in localStorage under 'brainteaser_consent'
 */

class ConsentBanner {
    constructor(options = {}) {
        this.version = '1.0';
        this.storageKey = 'brainteaser_consent';
        this.config = {
            bannerDelay: 500, // ms before showing banner
            animationDuration: 300,
            consentExpiry: 365 * 24 * 60 * 60 * 1000, // 1 year in ms
            ...options,
        };
        
        this.consent = this.loadConsent();
        this.init();
    }

    init() {
        // Only show banner if consent hasn't been given yet
        if (!this.consent.version || this.consent.version !== this.version) {
            setTimeout(() => this.showBanner(), this.config.bannerDelay);
        }
    }

    loadConsent() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    saveConsent(analytics, essential = true) {
        this.consent = {
            version: this.version,
            essential,
            analytics,
            timestamp: Date.now(),
            expiry: Date.now() + this.config.consentExpiry,
        };
        localStorage.setItem(this.storageKey, JSON.stringify(this.consent));
    }

    showBanner() {
        const container = document.getElementById('consent-banner');
        if (!container) {
            console.warn('Consent banner container (#consent-banner) not found');
            return;
        }

        container.innerHTML = this.renderBanner();
        container.classList.add('consent-banner--visible');

        // Attach event listeners
        document.querySelector('[data-action="consent-accept"]')?.addEventListener('click', () => {
            this.accept();
        });
        document.querySelector('[data-action="consent-settings"]')?.addEventListener('click', () => {
            this.showSettings();
        });
        document.querySelector('[data-action="consent-reject"]')?.addEventListener('click', () => {
            this.reject();
        });
        document.querySelector('[data-action="consent-settings-save"]')?.addEventListener('click', () => {
            this.saveSettings();
        });
        document.querySelector('[data-action="consent-settings-back"]')?.addEventListener('click', () => {
            this.showBanner();
        });
    }

    hideBanner() {
        const container = document.getElementById('consent-banner');
        if (container) {
            container.classList.remove('consent-banner--visible');
            setTimeout(() => {
                container.innerHTML = '';
            }, this.config.animationDuration);
        }
    }

    accept() {
        this.saveConsent(true, true);
        this.hideBanner();
        this.fireEvent('consent:accepted', { analytics: true, essential: true });
    }

    reject() {
        this.saveConsent(false, true);
        this.hideBanner();
        this.fireEvent('consent:rejected', { analytics: false, essential: true });
    }

    showSettings() {
        const container = document.getElementById('consent-banner');
        container.innerHTML = this.renderSettings();
        document.querySelector('[data-action="consent-settings-save"]')?.addEventListener('click', () => {
            this.saveSettings();
        });
        document.querySelector('[data-action="consent-settings-back"]')?.addEventListener('click', () => {
            this.showBanner();
        });
    }

    saveSettings() {
        const analyticsCheckbox = document.querySelector('[data-consent="analytics"]');
        const analytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
        this.saveConsent(analytics, true);
        this.hideBanner();
        this.fireEvent('consent:updated', { analytics, essential: true });
    }

    fireEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    renderBanner() {
        return `
            <div class="consent-banner__content">
                <div class="consent-banner__header">
                    <h2 class="consent-banner__title">Privacy & Cookies</h2>
                </div>
                <div class="consent-banner__body">
                    <p class="consent-banner__text">
                        We use cookies and analytics to improve your experience. Essential cookies are always required 
                        for the app to work. You can choose whether we measure usage to help us improve.
                    </p>
                    <p class="consent-banner__text consent-banner__text--small">
                        <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Read our full Privacy Policy</a>
                    </p>
                </div>
                <div class="consent-banner__actions">
                    <button class="consent-banner__btn consent-banner__btn--secondary" data-action="consent-settings">
                        Settings
                    </button>
                    <button class="consent-banner__btn consent-banner__btn--secondary" data-action="consent-reject">
                        Reject
                    </button>
                    <button class="consent-banner__btn consent-banner__btn--primary" data-action="consent-accept">
                        Accept All
                    </button>
                </div>
            </div>
        `;
    }

    renderSettings() {
        return `
            <div class="consent-banner__content">
                <div class="consent-banner__header">
                    <h2 class="consent-banner__title">Privacy Settings</h2>
                </div>
                <div class="consent-banner__body">
                    <div class="consent-banner__option">
                        <div class="consent-banner__option-header">
                            <input type="checkbox" id="consent-essential" checked disabled class="consent-banner__checkbox">
                            <label for="consent-essential" class="consent-banner__option-label">
                                <strong>Essential Cookies</strong>
                                <span class="consent-banner__badge">Always On</span>
                            </label>
                        </div>
                        <p class="consent-banner__option-description">
                            Required for basic app functionality: saving your progress, settings, and scores.
                        </p>
                    </div>
                    <div class="consent-banner__option">
                        <div class="consent-banner__option-header">
                            <input type="checkbox" id="consent-analytics" data-consent="analytics" 
                                ${this.consent.analytics ? 'checked' : ''} 
                                class="consent-banner__checkbox">
                            <label for="consent-analytics" class="consent-banner__option-label">
                                <strong>Analytics</strong>
                            </label>
                        </div>
                        <p class="consent-banner__option-description">
                            Helps us understand how you use the app and which features need improvement. 
                            Privacy-respecting, aggregated, and never used for advertising.
                        </p>
                    </div>
                </div>
                <div class="consent-banner__actions">
                    <button class="consent-banner__btn consent-banner__btn--secondary" data-action="consent-settings-back">
                        Back
                    </button>
                    <button class="consent-banner__btn consent-banner__btn--primary" data-action="consent-settings-save">
                        Save Settings
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Global function to check if a specific consent has been given
 * Usage: if (window.consentGiven('analytics')) { loadAnalytics(); }
 */
window.consentGiven = function(consentType) {
    try {
        const consent = JSON.parse(localStorage.getItem('brainteaser_consent') || '{}');
        return consent[consentType] === true;
    } catch {
        return false;
    }
};

/**
 * Initialize the consent banner when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    new ConsentBanner();
});
