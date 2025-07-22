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
        
        // Advanced vulnerability detection based on PortSwigger Web Security Academy
        detectAdvancedVulnerabilities(technologies);
        
        // Detect modern attack vectors
        detectModernAttackVectors(technologies);
        
        // Detect business logic vulnerabilities
        detectBusinessLogicVulns(technologies);
        
        // Advanced PortSwigger methodologies - Round 2
        detectAdvancedCSRFVulns(technologies);
        detectClickjackingVulns(technologies);
        detectCORSMisconfigurations(technologies);
        detectAdvancedFileUploadVulns(technologies);
        detectWebSocketAdvancedVulns(technologies);
        detectAdvancedDeserializationVulns(technologies);
        detectAdvancedRaceConditions(technologies);
        detectWebLLMAttacks(technologies);
        detectAdvancedCachePoisoning(technologies);
        detectRequestSmugglingAdvanced(technologies);
        detectDOMManipulationAttacks(technologies);
        detectOAuthVulnerabilities(technologies);
        detectWAFBypassIndicators(technologies);
        detectOutOfBandAttackVectors(technologies);
        
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

function detectAdvancedVulnerabilities(technologies) {
    // Advanced vulnerability detection based on PortSwigger Web Security Academy
    
    // SQL Injection indicators
    detectSQLInjectionIndicators(technologies);
    
    // XXE vulnerabilities
    detectXXEVulnerabilities(technologies);
    
    // SSRF indicators
    detectSSRFIndicators(technologies);
    
    // Command injection
    detectCommandInjectionIndicators(technologies);
    
    // Path traversal
    detectPathTraversalIndicators(technologies);
    
    // File upload vulnerabilities
    detectFileUploadVulns(technologies);
    
    // Insecure deserialization
    detectDeserializationVulns(technologies);
}

function detectModernAttackVectors(technologies) {
    // Modern attack vectors from PortSwigger Academy
    
    // Server-side template injection
    detectSSTI(technologies);
    
    // Web cache poisoning
    detectCachePoisoning(technologies);
    
    // HTTP request smuggling
    detectRequestSmuggling(technologies);
    
    // WebSocket vulnerabilities
    detectWebSocketVulns(technologies);
    
    // JWT vulnerabilities
    detectJWTVulns(technologies);
    
    // GraphQL vulnerabilities
    detectGraphQLVulns(technologies);
    
    // NoSQL injection
    detectNoSQLInjection(technologies);
    
    // Prototype pollution
    detectPrototypePollution(technologies);
    
    // Race conditions
    detectRaceConditions(technologies);
}

function detectBusinessLogicVulns(technologies) {
    // Business logic vulnerability patterns
    
    // Authentication bypass
    detectAuthBypass(technologies);
    
    // Information disclosure
    detectAdvancedInfoDisclosure(technologies);
    
    // Business logic flaws
    detectBusinessLogicFlaws(technologies);
    
    // Access control issues
    detectAccessControlIssues(technologies);
}

function detectSQLInjectionIndicators(technologies) {
    // Look for SQL injection vulnerability indicators
    const sqlIndicators = [];
    
    // Check for database-related forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[name*="id"], input[name*="user"], input[name*="search"], input[name*="query"]');
        if (inputs.length > 0) {
            sqlIndicators.push('Forms with database query parameters detected');
        }
    });
    
    // Check for database error messages in page content
    const errorPatterns = [
        /mysql.*error/i, /sql.*syntax/i, /ora-\d+/i, /postgresql.*error/i,
        /sqlite.*error/i, /microsoft.*odbc/i, /oledb.*error/i
    ];
    const pageText = document.body.textContent.toLowerCase();
    errorPatterns.forEach(pattern => {
        if (pattern.test(pageText)) {
            sqlIndicators.push('Database error messages detected');
        }
    });
    
    if (sqlIndicators.length > 0) {
        technologies.security.push('SQL Injection Risk Indicators');
    }
}

function detectXXEVulnerabilities(technologies) {
    // XML External Entity vulnerability indicators
    const xmlForms = document.querySelectorAll('form[enctype*="xml"], form input[type="file"][accept*="xml"]');
    const xmlContent = document.querySelectorAll('*[contenttype*="xml"], *[data-format="xml"]');
    
    if (xmlForms.length > 0 || xmlContent.length > 0) {
        technologies.security.push('XXE Vulnerability Risk');
    }
}

function detectSSRFIndicators(technologies) {
    // Server-Side Request Forgery indicators
    const ssrfIndicators = [];
    
    // Look for URL input fields
    const urlInputs = document.querySelectorAll('input[name*="url"], input[name*="link"], input[name*="callback"], input[name*="redirect"]');
    if (urlInputs.length > 0) {
        ssrfIndicators.push('URL input fields detected');
    }
    
    // Check for webhook or callback functionality
    const webhookElements = document.querySelectorAll('*[data-webhook], *[data-callback]');
    if (webhookElements.length > 0) {
        ssrfIndicators.push('Webhook/callback functionality detected');
    }
    
    if (ssrfIndicators.length > 0) {
        technologies.security.push('SSRF Risk Indicators');
    }
}

function detectCommandInjectionIndicators(technologies) {
    // OS Command injection indicators
    const cmdInputs = document.querySelectorAll('input[name*="cmd"], input[name*="command"], input[name*="exec"], input[name*="system"]');
    const pingTools = document.querySelectorAll('*[data-tool="ping"], *[data-action="ping"]');
    
    if (cmdInputs.length > 0 || pingTools.length > 0) {
        technologies.security.push('Command Injection Risk');
    }
}

function detectPathTraversalIndicators(technologies) {
    // Directory traversal vulnerability indicators
    const fileInputs = document.querySelectorAll('input[name*="file"], input[name*="path"], input[name*="dir"], input[name*="folder"]');
    const downloadLinks = document.querySelectorAll('a[href*="download"], a[href*="file"]');
    
    if (fileInputs.length > 0 || downloadLinks.length > 0) {
        technologies.security.push('Path Traversal Risk');
    }
}

function detectDeserializationVulns(technologies) {
    // Insecure deserialization indicators
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        const content = script.textContent;
        if (content.includes('serialize') || content.includes('unserialize') || 
            content.includes('pickle') || content.includes('marshal')) {
            technologies.security.push('Deserialization Risk');
        }
    });
}

function detectCachePoisoning(technologies) {
    // Web cache poisoning indicators
    const cacheHeaders = document.querySelector('meta[http-equiv*="cache"]');
    if (cacheHeaders || document.querySelectorAll('*[data-cache]').length > 0) {
        technologies.security.push('Cache Implementation Detected');
    }
}

function detectRequestSmuggling(technologies) {
    // HTTP request smuggling indicators
    if (document.querySelectorAll('form[method="POST"]').length > 0) {
        technologies.security.push('POST Request Forms (Smuggling Risk)');
    }
}

function detectFileUploadVulns(technologies) {
    // File upload vulnerability indicators
    const fileUploads = document.querySelectorAll('input[type="file"]');
    if (fileUploads.length > 0) {
        technologies.security.push('File Upload Functionality');
        
        // Check for dangerous file type acceptance
        fileUploads.forEach(upload => {
            const accept = upload.getAttribute('accept');
            if (!accept || accept.includes('*') || accept.includes('.exe') || accept.includes('.php')) {
                technologies.security.push('Unrestricted File Upload Risk');
            }
        });
    }
}

function detectSSTI(technologies) {
    // Server-Side Template Injection indicators
    const templatePatterns = [
        /\{\{.*\}\}/, /\{%.*%\}/, /\$\{.*\}/, /<#.*#>/
    ];
    const pageSource = document.documentElement.outerHTML;
    
    templatePatterns.forEach(pattern => {
        if (pattern.test(pageSource)) {
            technologies.security.push('Template Engine Detected (SSTI Risk)');
        }
    });
}

function detectWebSocketVulns(technologies) {
    // WebSocket security issues
    if (window.WebSocket || window.MozWebSocket) {
        technologies.security.push('WebSocket Implementation');
        
        // Check for insecure WebSocket usage
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.textContent.includes('ws://') && !script.textContent.includes('wss://')) {
                technologies.security.push('Insecure WebSocket (ws://) Detected');
            }
        });
    }
}

function detectJWTVulns(technologies) {
    // JWT vulnerability indicators
    const localStorage = window.localStorage;
    const sessionStorage = window.sessionStorage;
    
    try {
        // Check for JWT tokens in storage
        for (let key in localStorage) {
            const value = localStorage.getItem(key);
            if (value && (value.includes('eyJ') || key.toLowerCase().includes('jwt') || key.toLowerCase().includes('token'))) {
                technologies.security.push('JWT Tokens in Local Storage');
                break;
            }
        }
        
        for (let key in sessionStorage) {
            const value = sessionStorage.getItem(key);
            if (value && (value.includes('eyJ') || key.toLowerCase().includes('jwt') || key.toLowerCase().includes('token'))) {
                technologies.security.push('JWT Tokens in Session Storage');
                break;
            }
        }
    } catch (e) {
        // Storage access might be restricted
    }
}

function detectGraphQLVulns(technologies) {
    // GraphQL vulnerability indicators
    const graphqlIndicators = document.querySelectorAll('*[data-graphql], script[src*="graphql"]');
    if (graphqlIndicators.length > 0 || window.GraphQL || document.body.textContent.includes('__schema')) {
        technologies.security.push('GraphQL Implementation');
    }
}

function detectNoSQLInjection(technologies) {
    // NoSQL injection indicators
    if (window.MongoDB || window.mongoose || 
        document.querySelectorAll('script[src*="mongo"]').length > 0) {
        technologies.security.push('NoSQL Database Indicators');
    }
}

function detectPrototypePollution(technologies) {
    // JavaScript prototype pollution indicators
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('prototype') && 
            (script.textContent.includes('merge') || script.textContent.includes('extend'))) {
            technologies.security.push('Prototype Pollution Risk');
        }
    });
}

function detectRaceConditions(technologies) {
    // Race condition vulnerability indicators
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        if (submitBtns.length > 0 && !form.hasAttribute('data-once')) {
            technologies.security.push('Potential Race Condition (Multiple Submit)');
        }
    });
}

function detectAuthBypass(technologies) {
    // Authentication bypass indicators
    const authForms = document.querySelectorAll('form[action*="login"], form[action*="auth"], #login-form, .login-form');
    if (authForms.length > 0) {
        technologies.security.push('Authentication Forms Detected');
        
        // Check for remember me functionality
        const rememberMe = document.querySelectorAll('input[name*="remember"], input[id*="remember"]');
        if (rememberMe.length > 0) {
            technologies.security.push('Remember Me Functionality');
        }
    }
}

function detectAdvancedInfoDisclosure(technologies) {
    // Advanced information disclosure patterns
    const sensitiveComments = document.evaluate(
        '//comment()[contains(., "TODO") or contains(., "FIXME") or contains(., "password") or contains(., "secret")]',
        document, null, XPathResult.ANY_TYPE, null
    );
    
    if (sensitiveComments.iterateNext()) {
        technologies.security.push('Sensitive Information in Comments');
    }
    
    // Check for development/staging indicators
    if (window.location.hostname.includes('dev') || 
        window.location.hostname.includes('test') ||
        window.location.hostname.includes('staging') ||
        document.querySelector('meta[name="environment"][content*="dev"]')) {
        technologies.development.push('Development/Staging Environment');
    }
}

function detectBusinessLogicFlaws(technologies) {
    // Business logic vulnerability patterns
    const priceInputs = document.querySelectorAll('input[name*="price"], input[name*="amount"], input[name*="quantity"]');
    if (priceInputs.length > 0) {
        technologies.security.push('Price/Quantity Manipulation Risk');
    }
    
    // Check for discount/coupon functionality
    const discountInputs = document.querySelectorAll('input[name*="discount"], input[name*="coupon"], input[name*="promo"]');
    if (discountInputs.length > 0) {
        technologies.security.push('Discount/Coupon Logic');
    }
}

function detectAccessControlIssues(technologies) {
    // Access control vulnerability indicators
    const adminLinks = document.querySelectorAll('a[href*="/admin"], a[href*="/management"], a[href*="/dashboard"]');
    if (adminLinks.length > 0) {
        technologies.security.push('Administrative Interface Links');
    }
    
    // Check for user ID in URLs or forms
    const userIdElements = document.querySelectorAll('*[name*="user_id"], *[name*="userId"], *[data-user-id]');
    if (userIdElements.length > 0) {
        technologies.security.push('User ID Exposure Risk');
    }
}

// Advanced PortSwigger Web Security Academy Methodologies - Round 2

function detectAdvancedCSRFVulns(technologies) {
    // Comprehensive CSRF vulnerability detection
    const forms = document.querySelectorAll('form');
    let csrfTokenFound = false;
    let stateLessActionsFound = false;
    
    forms.forEach(form => {
        const method = form.method?.toLowerCase();
        if (method === 'post' || method === 'put' || method === 'delete') {
            // Check for CSRF tokens
            const csrfInputs = form.querySelectorAll('input[name*="csrf"], input[name*="token"], input[name*="_token"], input[name="authenticity_token"]');
            if (csrfInputs.length === 0) {
                technologies.security.push('CSRF Token Missing');
            } else {
                csrfTokenFound = true;
            }
            
            // Check for state-changing actions
            const actionUrl = form.action || form.getAttribute('action');
            if (actionUrl && (actionUrl.includes('delete') || actionUrl.includes('transfer') || actionUrl.includes('change'))) {
                stateLessActionsFound = true;
            }
        }
    });
    
    // Check for JSON endpoints
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('application/json') && script.textContent.includes('POST')) {
            technologies.security.push('JSON-based CSRF Risk');
        }
    });
    
    if (csrfTokenFound && stateLessActionsFound) {
        technologies.security.push('CSRF Protection Detected');
    }
}

function detectClickjackingVulns(technologies) {
    // Advanced clickjacking detection
    const frameKillers = [
        'top.location', 'self.location', 'parent.location',
        'frameElement', 'X-Frame-Options', 'frame-ancestors'
    ];
    
    let protectionFound = false;
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        frameKillers.forEach(killer => {
            if (script.textContent.includes(killer)) {
                protectionFound = true;
            }
        });
    });
    
    // Check for sensitive actions that could be clickjacked
    const sensitiveButtons = document.querySelectorAll('button[onclick*="delete"], button[onclick*="confirm"], input[type="submit"][value*="Delete"]');
    if (sensitiveButtons.length > 0 && !protectionFound) {
        technologies.security.push('Clickjacking Vulnerability Risk');
    }
    
    // Check for iframe embedding potential
    if (window.self === window.top && !protectionFound) {
        technologies.security.push('No Frame Protection Detected');
    }
}

function detectCORSMisconfigurations(technologies) {
    // Advanced CORS misconfiguration detection
    const corsPatterns = [];
    
    // Check for wildcard origins in development
    if (window.location.hostname.includes('localhost') || 
        window.location.hostname.includes('dev') ||
        window.location.hostname.includes('staging')) {
        corsPatterns.push('Development CORS Configuration');
    }
    
    // Check for CORS-related JavaScript
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        const content = script.textContent;
        if (content.includes('Access-Control-Allow-Origin') && content.includes('*')) {
            technologies.security.push('Wildcard CORS Origin Detected');
        }
        if (content.includes('withCredentials: true')) {
            technologies.security.push('CORS with Credentials');
        }
        if (content.includes('crossDomain: true')) {
            technologies.security.push('Cross-Domain Request Configuration');
        }
    });
    
    // Check for subdomain enumeration potential
    const subdomainElements = document.querySelectorAll('a[href*="//"], script[src*="//"], link[href*="//"]');
    const uniqueSubdomains = new Set();
    subdomainElements.forEach(el => {
        const url = el.href || el.src;
        if (url) {
            try {
                const domain = new URL(url).hostname;
                if (domain !== window.location.hostname && domain.includes(window.location.hostname.split('.').slice(-2).join('.'))) {
                    uniqueSubdomains.add(domain);
                }
            } catch (e) {}
        }
    });
    
    if (uniqueSubdomains.size > 0) {
        technologies.security.push('Subdomain CORS Attack Surface');
    }
}

function detectAdvancedFileUploadVulns(technologies) {
    // Comprehensive file upload vulnerability detection
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const accept = input.getAttribute('accept');
        const maxSize = input.getAttribute('max-size') || input.getAttribute('data-max-size');
        
        // Check for dangerous file type acceptance
        if (!accept || accept.includes('*/*') || accept === '*') {
            technologies.security.push('Unrestricted File Upload');
        }
        
        // Check for executable file types
        const dangerousTypes = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.php', '.asp', '.jsp', '.js'];
        if (accept && dangerousTypes.some(type => accept.includes(type))) {
            technologies.security.push('Dangerous File Type Upload');
        }
        
        // Check for missing size restrictions
        if (!maxSize) {
            technologies.security.push('No File Size Restrictions');
        }
        
        // Check for multiple file upload
        if (input.hasAttribute('multiple')) {
            technologies.security.push('Multiple File Upload');
        }
    });
    
    // Check for drag & drop upload areas
    const dropZones = document.querySelectorAll('*[ondrop], *[data-drop], .dropzone, .file-drop');
    if (dropZones.length > 0) {
        technologies.security.push('Drag & Drop File Upload');
    }
    
    // Check for AJAX file upload
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('FormData') && script.textContent.includes('upload')) {
            technologies.security.push('AJAX File Upload');
        }
    });
}

function detectWebSocketAdvancedVulns(technologies) {
    // Advanced WebSocket security analysis
    if (window.WebSocket || window.MozWebSocket) {
        const scripts = document.querySelectorAll('script');
        
        scripts.forEach(script => {
            const content = script.textContent;
            
            // Check for insecure WebSocket origins
            if (content.includes('new WebSocket') && !content.includes('wss://')) {
                technologies.security.push('Insecure WebSocket Protocol');
            }
            
            // Check for lack of origin validation
            if (content.includes('WebSocket') && !content.includes('origin')) {
                technologies.security.push('WebSocket Origin Validation Missing');
            }
            
            // Check for message handling without validation
            if (content.includes('onmessage') && !content.includes('JSON.parse')) {
                technologies.security.push('WebSocket Message Validation Risk');
            }
            
            // Check for automatic reconnection
            if (content.includes('onclose') && content.includes('setTimeout')) {
                technologies.security.push('WebSocket Auto-Reconnection');
            }
        });
    }
}

function detectAdvancedDeserializationVulns(technologies) {
    // Enhanced insecure deserialization detection
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        const content = script.textContent;
        
        // Check for various serialization libraries
        const serializationPatterns = [
            'JSON.parse', 'eval(', 'Function(', 'setTimeout(',
            'setInterval(', 'unserialize', 'pickle.loads',
            'yaml.load', 'xml.parse', 'base64.decode'
        ];
        
        serializationPatterns.forEach(pattern => {
            if (content.includes(pattern)) {
                technologies.security.push('Data Deserialization Detected');
            }
        });
        
        // Check for dynamic code execution patterns
        if (content.includes('eval(') && content.includes('user')) {
            technologies.security.push('User-Controlled Eval Risk');
        }
        
        // Check for template engines with unsafe operations
        if (content.includes('compile') && (content.includes('template') || content.includes('render'))) {
            technologies.security.push('Template Compilation Risk');
        }
    });
}

function detectAdvancedRaceConditions(technologies) {
    // Comprehensive race condition detection
    const forms = document.querySelectorAll('form');
    let potentialRaceConditions = [];
    
    forms.forEach(form => {
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        
        // Check for forms without protection against double submission
        if (submitButtons.length > 0 && !form.hasAttribute('data-submitted') && !form.querySelector('input[type="hidden"][name*="nonce"]')) {
            potentialRaceConditions.push('Double Submit Protection Missing');
        }
        
        // Check for financial/quantity operations
        const moneyInputs = form.querySelectorAll('input[name*="amount"], input[name*="price"], input[name*="quantity"], input[name*="balance"]');
        if (moneyInputs.length > 0) {
            technologies.security.push('Financial Race Condition Risk');
        }
        
        // Check for user registration/creation forms
        const userInputs = form.querySelectorAll('input[name*="username"], input[name*="email"], input[name*="register"]');
        if (userInputs.length > 0) {
            technologies.security.push('User Creation Race Condition Risk');
        }
    });
    
    // Check for AJAX operations without proper sequencing
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('XMLHttpRequest') && script.textContent.includes('setInterval')) {
            technologies.security.push('Concurrent AJAX Operations');
        }
    });
    
    if (potentialRaceConditions.length > 0) {
        technologies.security.push('Race Condition Vulnerabilities');
    }
}

function detectWebLLMAttacks(technologies) {
    // Web LLM attack surface detection (newest PortSwigger topic)
    const llmIndicators = [];
    
    // Check for AI/ML integration
    const aiPatterns = ['openai', 'chatgpt', 'claude', 'llm', 'ai-chat', 'machine-learning', 'neural', 'gpt'];
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        aiPatterns.forEach(pattern => {
            if (script.textContent.toLowerCase().includes(pattern)) {
                llmIndicators.push('AI/LLM Integration Detected');
            }
        });
    });
    
    // Check for chatbot interfaces
    const chatElements = document.querySelectorAll('.chat, .chatbot, #chat, *[data-chat], *[class*="conversation"]');
    if (chatElements.length > 0) {
        technologies.security.push('Chatbot Interface Detected');
    }
    
    // Check for prompt injection vectors
    const textAreas = document.querySelectorAll('textarea, input[type="text"]');
    textAreas.forEach(input => {
        const placeholder = input.placeholder?.toLowerCase() || '';
        const name = input.name?.toLowerCase() || '';
        
        if (placeholder.includes('ask') || placeholder.includes('prompt') || 
            name.includes('query') || name.includes('prompt')) {
            technologies.security.push('LLM Prompt Injection Vector');
        }
    });
    
    if (llmIndicators.length > 0) {
        technologies.security.push('Web LLM Attack Surface');
    }
}

function detectAdvancedCachePoisoning(technologies) {
    // Advanced web cache poisoning detection
    const cachePatterns = [];
    
    // Check for cache headers and implementations
    const metaTags = document.querySelectorAll('meta[http-equiv*="cache"], meta[name*="cache"]');
    if (metaTags.length > 0) {
        cachePatterns.push('Cache Control Detected');
    }
    
    // Check for CDN usage (cache poisoning targets)
    const cdnPatterns = ['cloudflare', 'cloudfront', 'fastly', 'akamai', 'maxcdn'];
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
        cdnPatterns.forEach(cdn => {
            if (script.src.includes(cdn)) {
                technologies.security.push('CDN Cache Poisoning Target');
            }
        });
    });
    
    // Check for query parameter handling
    const forms = document.querySelectorAll('form[method="get"]');
    if (forms.length > 0) {
        technologies.security.push('GET Parameter Cache Keys');
    }
    
    // Check for user-agent dependent content
    const userAgentChecks = document.querySelectorAll('script');
    userAgentChecks.forEach(script => {
        if (script.textContent.includes('navigator.userAgent') || script.textContent.includes('User-Agent')) {
            technologies.security.push('User-Agent Dependent Content');
        }
    });
}

function detectRequestSmugglingAdvanced(technologies) {
    // Advanced HTTP request smuggling indicators
    const forms = document.querySelectorAll('form[method="post"]');
    
    if (forms.length > 0) {
        technologies.security.push('POST Request Smuggling Target');
    }
    
    // Check for chunked encoding indicators
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('Transfer-Encoding') || script.textContent.includes('Content-Length')) {
            technologies.security.push('HTTP Header Manipulation Risk');
        }
    });
    
    // Check for proxy/load balancer indicators
    const proxyHeaders = ['X-Forwarded-For', 'X-Real-IP', 'X-Forwarded-Proto'];
    proxyHeaders.forEach(header => {
        if (document.querySelector(`meta[name="${header}"], meta[http-equiv="${header}"]`)) {
            technologies.security.push('Proxy/Load Balancer Detected');
        }
    });
}

function detectDOMManipulationAttacks(technologies) {
    // Advanced DOM manipulation vulnerability detection
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
        const content = script.textContent;
        
        // Check for dangerous DOM manipulation functions
        const dangerousFunctions = [
            'innerHTML', 'outerHTML', 'insertAdjacentHTML',
            'document.write', 'document.writeln', 'eval('
        ];
        
        dangerousFunctions.forEach(func => {
            if (content.includes(func) && content.includes('user')) {
                technologies.security.push('DOM Manipulation Risk');
            }
        });
        
        // Check for location manipulation
        if (content.includes('location.href') || content.includes('window.location')) {
            technologies.security.push('Location Manipulation Risk');
        }
        
        // Check for postMessage without origin validation
        if (content.includes('postMessage') && !content.includes('origin')) {
            technologies.security.push('PostMessage Without Origin Check');
        }
    });
    
    // Check for message event listeners
    if (document.body.getAttribute('onmessage') || document.querySelector('*[onmessage]')) {
        technologies.security.push('Message Event Listeners');
    }
}

function detectOAuthVulnerabilities(technologies) {
    // OAuth 2.0 vulnerability detection
    const oauthIndicators = [];
    
    // Check for OAuth implementations
    const oauthElements = document.querySelectorAll('a[href*="oauth"], a[href*="/auth"], button[onclick*="oauth"]');
    if (oauthElements.length > 0) {
        oauthIndicators.push('OAuth Implementation Detected');
    }
    
    // Check for social login buttons
    const socialLogins = document.querySelectorAll('*[class*="google"], *[class*="facebook"], *[class*="twitter"], *[class*="github"]');
    if (socialLogins.length > 0) {
        technologies.security.push('Social OAuth Providers');
    }
    
    // Check for redirect_uri parameters in URLs
    if (window.location.href.includes('redirect_uri') || window.location.href.includes('callback')) {
        technologies.security.push('OAuth Redirect URI');
    }
    
    // Check for state parameter handling
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('state') && script.textContent.includes('oauth')) {
            technologies.security.push('OAuth State Parameter');
        }
    });
    
    if (oauthIndicators.length > 0) {
        technologies.security.push('OAuth Attack Surface');
    }
}

function detectWAFBypassIndicators(technologies) {
    // Web Application Firewall bypass indicators
    const wafIndicators = [];
    
    // Check for WAF protection services
    const wafProviders = ['cloudflare', 'incapsula', 'akamai', 'imperva', 'f5', 'barracuda'];
    const allElements = document.querySelectorAll('script[src], link[href], meta[content]');
    
    allElements.forEach(el => {
        const url = el.src || el.href || el.content || '';
        wafProviders.forEach(provider => {
            if (url.toLowerCase().includes(provider)) {
                wafIndicators.push(`${provider} WAF Detected`);
            }
        });
    });
    
    // Check for rate limiting indicators
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.querySelector('input[name*="captcha"]') || form.querySelector('.g-recaptcha')) {
            technologies.security.push('CAPTCHA Protection (WAF Bypass Target)');
        }
    });
    
    if (wafIndicators.length > 0) {
        technologies.security.push('WAF Bypass Opportunity');
    }
}

function detectOutOfBandAttackVectors(technologies) {
    // Out-of-band attack vector detection
    const oobVectors = [];
    
    // Check for external URL inputs
    const urlInputs = document.querySelectorAll('input[name*="url"], input[name*="webhook"], input[name*="callback"]');
    if (urlInputs.length > 0) {
        oobVectors.push('External URL Input');
    }
    
    // Check for email functionality
    const emailForms = document.querySelectorAll('form[action*="email"], form[action*="contact"], input[name*="email"]');
    if (emailForms.length > 0) {
        technologies.security.push('Email Out-of-Band Vector');
    }
    
    // Check for file inclusion patterns
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
        if (script.textContent.includes('include') || script.textContent.includes('require')) {
            technologies.security.push('File Inclusion OOB Vector');
        }
    });
    
    // Check for DNS resolution functionality
    const dnsElements = document.querySelectorAll('*[data-dns], input[name*="domain"], input[name*="host"]');
    if (dnsElements.length > 0) {
        technologies.security.push('DNS Resolution OOB Vector');
    }
    
    if (oobVectors.length > 0) {
        technologies.security.push('Out-of-Band Attack Vectors');
    }
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