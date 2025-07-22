// Content script for PenTest Assistant Extension
// Runs on web pages to analyze DOM and collect technology information

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        switch (request.action) {
            case 'detectTechnology':
                const techData = detectTechnologies();
                sendResponse(techData);
                break;
            case 'getHeaders':
                // Headers are not accessible from content script
                // This is a fallback that returns available page information
                sendResponse(getPageInformation());
                break;
            default:
                sendResponse({ error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Content script error:', error);
        sendResponse({ error: error.message });
    }
    
    return true;
});

// Technology Detection Functions
function detectTechnologies() {
    const technologies = {
        server: [],
        framework: [],
        cms: [],
        analytics: [],
        javascript: [],
        css: [],
        fonts: [],
        security: [],
        development: [],
        cdn: [],
        other: []
    };
    
    try {
        // Detect JavaScript frameworks and libraries
        detectJavaScriptTechnologies(technologies);
        
        // Detect CSS frameworks
        detectCSSFrameworks(technologies);
        
        // Detect CMS platforms
        detectCMSPlatforms(technologies);
        
        // Detect analytics and tracking
        detectAnalytics(technologies);
        
        // Detect fonts
        detectFonts(technologies);
        
        // Detect meta information
        detectMetaInformation(technologies);
        
        // Detect from script sources
        detectFromScriptSources(technologies);
        
        // Detect from link tags
        detectFromLinkTags(technologies);
        
        // Detect security tools
        detectSecurityTools(technologies);
        
        // Detect development tools
        detectDevelopmentTools(technologies);
        
        // Detect CDN services
        detectCDNServices(technologies);
        
    } catch (error) {
        console.error('Error detecting technologies:', error);
    }
    
    return technologies;
}

function detectJavaScriptTechnologies(technologies) {
    const frameworks = {
        'React': () => window.React || document.querySelector('[data-reactroot]') || document.querySelector('[data-react-checksum]') || document.querySelector('#root') && window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
        'Vue.js': () => window.Vue || document.querySelector('[data-server-rendered="true"]') || document.querySelector('div[id*="app"]') && window.__VUE__ || window.Vue?.version,
        'Angular': () => window.angular || window.ng || document.querySelector('[ng-app]') || document.querySelector('[data-ng-app]') || window.getAllAngularRootElements || document.querySelector('[ng-version]'),
        'AngularJS': () => window.angular && !window.ng,
        'jQuery': () => window.jQuery || window.$,
        'Bootstrap': () => window.bootstrap || document.querySelector('.bootstrap') || document.querySelector('[class*="btn-"]') || document.querySelector('[class*="container"]'),
        'Lodash': () => window._ && window._.VERSION,
        'Underscore.js': () => window._ && !window._.VERSION,
        'D3.js': () => window.d3,
        'Three.js': () => window.THREE,
        'Chart.js': () => window.Chart,
        'Moment.js': () => window.moment,
        'Axios': () => window.axios,
        'Express.js': () => document.querySelector('meta[name="generator"]')?.content.includes('Express'),
        'Next.js': () => window.__NEXT_DATA__ || document.querySelector('#__next') || document.querySelector('script[src*="_next"]'),
        'Nuxt.js': () => window.__NUXT__ || document.querySelector('#__nuxt') || document.querySelector('script[src*="_nuxt"]'),
        'Gatsby': () => window.___gatsby || document.querySelector('#gatsby-focus-wrapper') || document.querySelector('script[src*="gatsby"]'),
        'Ember.js': () => window.Ember || document.querySelector('#ember-app'),
        'Backbone.js': () => window.Backbone,
        'Knockout.js': () => window.ko,
        'Alpine.js': () => window.Alpine || document.querySelector('[x-data]'),
        'Svelte': () => window.__SVELTE__ || document.querySelector('[class*="svelte-"]'),
        'Meteor': () => window.Meteor || window.Package,
        'Mootools': () => window.MooTools,
        'Prototype': () => window.Prototype,
        'YUI': () => window.YUI || window.YAHOO,
        'Dojo': () => window.dojo || window.require?.dojo,
        'ExtJS': () => window.Ext,
        'Polymer': () => window.Polymer || document.querySelector('[is]'),
        'StencilJS': () => document.querySelector('[data-stencil]'),
        'Preact': () => window.preact || window.__PREACT_DEVTOOLS__,
        'LitElement': () => window.LitElement || document.querySelector('[_$litElement$]'),
        'Stimulus': () => window.Stimulus || document.querySelector('[data-controller]'),
        'Turbo': () => window.Turbo || document.querySelector('meta[name="turbo-cache-control"]'),
        'HTMX': () => window.htmx || document.querySelector('[hx-get]') || document.querySelector('[hx-post]'),
        'Alpine.js': () => window.Alpine || document.querySelector('[x-data]') || document.querySelector('[x-show]'),
        'Socket.io': () => window.io,
        'SockJS': () => window.SockJS,
        'RxJS': () => window.Rx || window.rxjs,
        'Immutable.js': () => window.Immutable,
        'Redux': () => window.Redux || window.__REDUX_DEVTOOLS_EXTENSION__,
        'MobX': () => window.mobx || window.__mobxDidRunLazyInitializers,
        'GraphQL': () => window.GraphQL || window.__APOLLO_CLIENT__,
        'Apollo': () => window.Apollo || window.__APOLLO_CLIENT__,
        'Relay': () => window.RelayRuntime
    };
    
    Object.entries(frameworks).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.javascript.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectCSSFrameworks(technologies) {
    const cssFrameworks = {
        'Bootstrap': () => document.querySelector('link[href*="bootstrap"]') || document.querySelector('.container') || document.querySelector('.row'),
        'Tailwind CSS': () => document.querySelector('link[href*="tailwind"]') || document.querySelector('[class*="bg-"]') || document.querySelector('[class*="text-"]'),
        'Bulma': () => document.querySelector('link[href*="bulma"]') || document.querySelector('.hero') || document.querySelector('.navbar'),
        'Foundation': () => document.querySelector('link[href*="foundation"]') || document.querySelector('.foundation-sites'),
        'Materialize': () => document.querySelector('link[href*="materialize"]') || document.querySelector('.material-icons'),
        'Semantic UI': () => document.querySelector('link[href*="semantic"]') || document.querySelector('.ui.button'),
        'Pure CSS': () => document.querySelector('link[href*="pure"]') || document.querySelector('.pure-'),
        'Animate.css': () => document.querySelector('link[href*="animate"]') || document.querySelector('[class*="animate__"]')
    };
    
    Object.entries(cssFrameworks).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.css.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectCMSPlatforms(technologies) {
    const cmsDetectors = {
        'WordPress': () => {
            return document.querySelector('meta[name="generator"][content*="WordPress"]') ||
                   document.querySelector('link[href*="wp-content"]') ||
                   document.querySelector('script[src*="wp-content"]') ||
                   document.querySelector('link[href*="wp-includes"]') ||
                   document.querySelector('body[class*="wordpress"]') ||
                   window.wp;
        },
        'Drupal': () => {
            return document.querySelector('meta[name="generator"][content*="Drupal"]') ||
                   document.querySelector('script[src*="drupal"]') ||
                   document.querySelector('body[class*="drupal"]') ||
                   document.querySelector('[data-drupal-selector]') ||
                   window.Drupal;
        },
        'Joomla': () => {
            return document.querySelector('meta[name="generator"][content*="Joomla"]') ||
                   document.querySelector('script[src*="joomla"]') ||
                   document.querySelector('script[src*="/media/system/js/"]') ||
                   window.Joomla;
        },
        'Magento': () => {
            return document.querySelector('script[src*="mage"]') ||
                   document.querySelector('body[class*="cms-"]') ||
                   document.querySelector('[data-container="body"]') ||
                   window.Magento;
        },
        'Shopify': () => {
            return document.querySelector('script[src*="shopify"]') ||
                   document.querySelector('link[href*="shopify"]') ||
                   document.querySelector('script[src*="shop.app"]') ||
                   window.Shopify;
        },
        'Squarespace': () => {
            return document.querySelector('script[src*="squarespace"]') ||
                   document.querySelector('link[href*="squarespace"]') ||
                   document.querySelector('body[id*="squarespace"]');
        },
        'Wix': () => {
            return document.querySelector('script[src*="wix"]') ||
                   document.querySelector('meta[name="generator"][content*="Wix"]') ||
                   document.querySelector('script[src*="wixstatic"]');
        },
        'Webflow': () => {
            return document.querySelector('script[src*="webflow"]') ||
                   document.querySelector('meta[name="generator"][content*="Webflow"]') ||
                   document.querySelector('script[src*="webflow.com"]');
        },
        'PrestaShop': () => {
            return document.querySelector('meta[name="generator"][content*="PrestaShop"]') ||
                   document.querySelector('script[src*="prestashop"]') ||
                   document.querySelector('body[id*="prestashop"]');
        },
        'OpenCart': () => {
            return document.querySelector('script[src*="opencart"]') ||
                   document.querySelector('link[href*="opencart"]');
        },
        'TYPO3': () => {
            return document.querySelector('meta[name="generator"][content*="TYPO3"]') ||
                   document.querySelector('script[src*="typo3"]');
        },
        'Ghost': () => {
            return document.querySelector('meta[name="generator"][content*="Ghost"]') ||
                   document.querySelector('script[src*="ghost.org"]');
        },
        'Craft CMS': () => {
            return document.querySelector('script[src*="craftcms"]') ||
                   document.querySelector('[data-craft]');
        },
        'Contentful': () => {
            return document.querySelector('script[src*="contentful"]') ||
                   window.contentful;
        },
        'Strapi': () => {
            return document.querySelector('script[src*="strapi"]') ||
                   window.strapi;
        }
    };
    
    Object.entries(cmsDetectors).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.cms.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectAnalytics(technologies) {
    const analyticsDetectors = {
        'Google Analytics': () => window.gtag || window.ga || window._gaq || document.querySelector('script[src*="google-analytics"]'),
        'Google Tag Manager': () => window.dataLayer || document.querySelector('script[src*="googletagmanager"]'),
        'Facebook Pixel': () => window.fbq || document.querySelector('script[src*="facebook"]'),
        'Hotjar': () => window.hj || document.querySelector('script[src*="hotjar"]'),
        'Mixpanel': () => window.mixpanel,
        'Adobe Analytics': () => window.s_account || window._satellite,
        'Segment': () => window.analytics,
        'Intercom': () => window.Intercom,
        'Zendesk': () => window.zE,
        'Drift': () => window.drift
    };
    
    Object.entries(analyticsDetectors).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.analytics.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectFonts(technologies) {
    const fontSources = new Set();
    
    // Check link tags for font sources
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        const href = link.href;
        if (href.includes('fonts.googleapis.com')) {
            fontSources.add('Google Fonts');
        } else if (href.includes('fonts.adobe.com') || href.includes('typekit.net')) {
            fontSources.add('Adobe Fonts');
        } else if (href.includes('cloud.typography.com')) {
            fontSources.add('Hoefler&Co Cloud Typography');
        }
    });
    
    // Check for Font Awesome
    if (document.querySelector('link[href*="font-awesome"]') || 
        document.querySelector('script[src*="font-awesome"]') ||
        document.querySelector('.fa') ||
        document.querySelector('[class*="fa-"]')) {
        fontSources.add('Font Awesome');
    }
    
    technologies.fonts = Array.from(fontSources);
}

function detectMetaInformation(technologies) {
    const generator = document.querySelector('meta[name="generator"]');
    if (generator && generator.content) {
        const content = generator.content.toLowerCase();
        
        if (content.includes('wordpress')) technologies.cms.push('WordPress');
        if (content.includes('drupal')) technologies.cms.push('Drupal');
        if (content.includes('joomla')) technologies.cms.push('Joomla');
        if (content.includes('hugo')) technologies.other.push('Hugo');
        if (content.includes('jekyll')) technologies.other.push('Jekyll');
        if (content.includes('gatsby')) technologies.framework.push('Gatsby');
        if (content.includes('next.js')) technologies.framework.push('Next.js');
    }
}

function detectFromScriptSources(technologies) {
    const scripts = document.querySelectorAll('script[src]');
    const scriptSources = Array.from(scripts).map(script => script.src.toLowerCase());
    
    // Popular CDNs and libraries
    const patterns = {
        'jQuery': /jquery/,
        'React': /react/,
        'Vue.js': /vue/,
        'Angular': /angular/,
        'Bootstrap': /bootstrap/,
        'Lodash': /lodash/,
        'D3.js': /d3\.js|d3\.min/,
        'Chart.js': /chart\.js/,
        'Google Analytics': /google-analytics|gtag/,
        'Google Tag Manager': /googletagmanager/,
        'Font Awesome': /font-awesome/,
        'Moment.js': /moment/,
        'Axios': /axios/
    };
    
    Object.entries(patterns).forEach(([tech, pattern]) => {
        if (scriptSources.some(src => pattern.test(src))) {
            if (tech.includes('Analytics') || tech.includes('Tag Manager')) {
                if (!technologies.analytics.includes(tech)) {
                    technologies.analytics.push(tech);
                }
            } else if (tech === 'Font Awesome') {
                if (!technologies.fonts.includes(tech)) {
                    technologies.fonts.push(tech);
                }
            } else {
                if (!technologies.javascript.includes(tech)) {
                    technologies.javascript.push(tech);
                }
            }
        }
    });
}

function detectFromLinkTags(technologies) {
    const links = document.querySelectorAll('link[href]');
    const linkHrefs = Array.from(links).map(link => link.href.toLowerCase());
    
    const patterns = {
        'Bootstrap': /bootstrap/,
        'Font Awesome': /font-awesome/,
        'Google Fonts': /fonts\.googleapis/,
        'Adobe Fonts': /fonts\.adobe|typekit/
    };
    
    Object.entries(patterns).forEach(([tech, pattern]) => {
        if (linkHrefs.some(href => pattern.test(href))) {
            if (tech.includes('Fonts') || tech === 'Font Awesome') {
                if (!technologies.fonts.includes(tech)) {
                    technologies.fonts.push(tech);
                }
            } else {
                if (!technologies.css.includes(tech)) {
                    technologies.css.push(tech);
                }
            }
        }
    });
}

function detectSecurityTools(technologies) {
    const securityTools = {
        'reCAPTCHA': () => window.grecaptcha || document.querySelector('.g-recaptcha') || document.querySelector('script[src*="recaptcha"]'),
        'hCaptcha': () => window.hcaptcha || document.querySelector('.h-captcha') || document.querySelector('script[src*="hcaptcha"]'),
        'Cloudflare Bot Management': () => document.querySelector('script[src*="cf-bm"]') || window.__CF$cv$params,
        'Imperva': () => document.querySelector('script[src*="incapsula"]') || document.querySelector('script[src*="imperva"]'),
        'DataDome': () => window.DD_RUM || document.querySelector('script[src*="datadome"]'),
        'PerimeterX': () => window._pxAppId || document.querySelector('script[src*="perimeterx"]'),
        'Distil Networks': () => document.querySelector('script[src*="distil"]'),
        'Akamai Bot Manager': () => document.querySelector('script[src*="akam.net"]') || window._akamai,
        'AWS WAF': () => document.querySelector('script[src*="aws-waf"]'),
        'Sucuri': () => document.querySelector('script[src*="sucuri"]'),
        'ModSecurity': () => document.querySelector('meta[name="generator"][content*="ModSecurity"]'),
        'CSP Reporting': () => document.querySelector('meta[http-equiv="Content-Security-Policy"][content*="report-uri"]'),
        'Subresource Integrity': () => document.querySelector('script[integrity]') || document.querySelector('link[integrity]')
    };
    
    Object.entries(securityTools).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.security.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectDevelopmentTools(technologies) {
    const devTools = {
        'React DevTools': () => window.__REACT_DEVTOOLS_GLOBAL_HOOK__,
        'Vue DevTools': () => window.__VUE_DEVTOOLS_GLOBAL_HOOK__,
        'Redux DevTools': () => window.__REDUX_DEVTOOLS_EXTENSION__,
        'Angular DevTools': () => window.ng?.getDebugNode,
        'Webpack': () => window.webpackJsonp || document.querySelector('script[src*="webpack"]'),
        'Vite': () => document.querySelector('script[type="module"][src*="@vite"]'),
        'Parcel': () => document.querySelector('script[src*="parcel"]'),
        'Rollup': () => document.querySelector('script[src*="rollup"]'),
        'Babel': () => document.querySelector('script[src*="babel"]'),
        'TypeScript': () => document.querySelector('script[type="module"][src*=".ts"]'),
        'ESLint': () => document.querySelector('script[src*="eslint"]'),
        'Prettier': () => document.querySelector('script[src*="prettier"]'),
        'Source Maps': () => document.querySelector('script[src$=".map"]') || document.querySelector('link[href$=".map"]'),
        'Hot Module Replacement': () => window.webpackHotUpdate || window.__HMR_PORT__,
        'Development Mode': () => {
            const isDev = window.location.hostname === 'localhost' || 
                         window.location.hostname.includes('dev') ||
                         window.location.hostname.includes('staging') ||
                         window.location.port !== '';
            return isDev && (document.querySelector('script[src*="development"]') || 
                           window.__DEV__ || 
                           window.NODE_ENV === 'development');
        },
        'Error Tracking': () => window.Sentry || window.Rollbar || window.Bugsnag || window.TrackJS,
        'Performance Monitoring': () => window.newrelic || window.dataLayer || window.gtag
    };
    
    Object.entries(devTools).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.development.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function detectCDNServices(technologies) {
    const cdnServices = {
        'Cloudflare': () => document.querySelector('script[src*="cloudflare"]') || document.querySelector('link[href*="cloudflare"]'),
        'jsDelivr': () => document.querySelector('script[src*="jsdelivr"]') || document.querySelector('link[href*="jsdelivr"]'),
        'unpkg': () => document.querySelector('script[src*="unpkg.com"]'),
        'cdnjs': () => document.querySelector('script[src*="cdnjs.cloudflare.com"]') || document.querySelector('link[href*="cdnjs.cloudflare.com"]'),
        'Google CDN': () => document.querySelector('script[src*="googleapis.com"]') || document.querySelector('link[href*="googleapis.com"]'),
        'Microsoft CDN': () => document.querySelector('script[src*="aspnetcdn.com"]') || document.querySelector('script[src*="ajax.microsoft.com"]'),
        'Amazon CloudFront': () => document.querySelector('script[src*="cloudfront.net"]') || document.querySelector('link[href*="cloudfront.net"]'),
        'KeyCDN': () => document.querySelector('script[src*="keycdn.com"]') || document.querySelector('link[href*="keycdn.com"]'),
        'MaxCDN': () => document.querySelector('script[src*="maxcdn.com"]') || document.querySelector('link[href*="maxcdn.com"]'),
        'Fastly': () => document.querySelector('script[src*="fastly.com"]') || document.querySelector('link[href*="fastly.com"]'),
        'Azure CDN': () => document.querySelector('script[src*="azureedge.net"]') || document.querySelector('link[href*="azureedge.net"]'),
        'StackPath': () => document.querySelector('script[src*="stackpath.com"]') || document.querySelector('link[href*="stackpath.com"]')
    };
    
    Object.entries(cdnServices).forEach(([name, detector]) => {
        try {
            if (detector()) {
                technologies.cdn.push(name);
            }
        } catch (e) {
            // Ignore detection errors
        }
    });
}

function getPageInformation() {
    return {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        generator: document.querySelector('meta[name="generator"]')?.content || '',
        author: document.querySelector('meta[name="author"]')?.content || '',
        charset: document.characterSet,
        lang: document.documentElement.lang || '',
        doctype: document.doctype?.name || 'unknown'
    };
}

// Initialize content script
console.log('PenTest Assistant content script loaded');

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        detectTechnologies,
        getPageInformation
    };
} 