// Background script for PenTest Assistant Extension

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyze') {
        handleAnalysisRequest(request)
            .then(result => sendResponse(result))
            .catch(error => {
                console.error('Analysis failed:', error);
                sendResponse({
                    success: false,
                    error: error.message || 'Analysis failed'
                });
            });
        return true; // Keep message channel open for async response
    }
});

// Main analysis handler
async function handleAnalysisRequest(request) {
    const { feature, url, tabId } = request;
    
    try {
        let data;
        
        switch (feature) {
            case 'headers':
                data = await analyzeHeaders(url, tabId);
                break;
            case 'technology':
                data = await analyzeTechnology(url, tabId);
                break;
            case 'certificate':
                data = await analyzeCertificate(url);
                break;
            default:
                throw new Error(`Unknown feature: ${feature}`);
        }
        
        return {
            success: true,
            data: data
        };
        
    } catch (error) {
        throw new Error(`Failed to analyze ${feature}: ${error.message}`);
    }
}

// Header Inspector Implementation
async function analyzeHeaders(url, tabId) {
    try {
        // Fetch the page to get headers
        const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        const headers = {};
        for (const [key, value] of response.headers.entries()) {
            headers[key] = value;
        }
        
        // Security headers analysis
        const securityHeaders = analyzeSecurityHeaders(headers);
        
        // Server information
        const serverInfo = extractServerInfo(headers);
        
        // Response analysis
        const responseInfo = {
            status: response.status,
            statusText: response.statusText,
            type: response.type,
            url: response.url,
            redirected: response.redirected
        };
        
        // Cookie analysis
        const cookieAnalysis = analyzeCookies(headers);
        
        // Information disclosure analysis
        const infoDisclosure = analyzeInfoDisclosure(headers);
        
        // Caching headers analysis
        const cachingHeaders = analyzeCachingHeaders(headers);
        
        return {
            headers,
            securityHeaders,
            serverInfo,
            responseInfo,
            cookieAnalysis,
            infoDisclosure,
            cachingHeaders,
            analyzedAt: new Date().toISOString()
        };
        
    } catch (error) {
        // Fallback: try to get headers from content script
        try {
            const result = await chrome.tabs.sendMessage(tabId, {
                action: 'getHeaders'
            });
            return result || { error: 'Could not retrieve headers' };
        } catch (contentError) {
            throw new Error('Could not retrieve headers: ' + error.message);
        }
    }
}

function analyzeSecurityHeaders(headers) {
    const securityHeaders = {
        'content-security-policy': headers['content-security-policy'] || null,
        'content-security-policy-report-only': headers['content-security-policy-report-only'] || null,
        'strict-transport-security': headers['strict-transport-security'] || null,
        'x-frame-options': headers['x-frame-options'] || null,
        'x-content-type-options': headers['x-content-type-options'] || null,
        'x-xss-protection': headers['x-xss-protection'] || null,
        'referrer-policy': headers['referrer-policy'] || null,
        'permissions-policy': headers['permissions-policy'] || null,
        'feature-policy': headers['feature-policy'] || null,
        'cross-origin-embedder-policy': headers['cross-origin-embedder-policy'] || null,
        'cross-origin-opener-policy': headers['cross-origin-opener-policy'] || null,
        'cross-origin-resource-policy': headers['cross-origin-resource-policy'] || null,
        'x-permitted-cross-domain-policies': headers['x-permitted-cross-domain-policies'] || null,
        'x-download-options': headers['x-download-options'] || null,
        'x-dns-prefetch-control': headers['x-dns-prefetch-control'] || null,
        'expect-ct': headers['expect-ct'] || null,
        'public-key-pins': headers['public-key-pins'] || null,
        'public-key-pins-report-only': headers['public-key-pins-report-only'] || null,
        'certificate-transparency': headers['certificate-transparency'] || null,
        'clear-site-data': headers['clear-site-data'] || null
    };
    
    const analysis = {
        headers: securityHeaders,
        score: calculateSecurityScore(securityHeaders),
        recommendations: generateSecurityRecommendations(securityHeaders)
    };
    
    return analysis;
}

function calculateSecurityScore(securityHeaders) {
    let score = 0;
    const maxScore = 15;
    
    // Critical security headers (higher weight)
    if (securityHeaders['content-security-policy']) score += 3;
    if (securityHeaders['strict-transport-security']) score += 3;
    
    // Important security headers
    if (securityHeaders['x-frame-options']) score += 2;
    if (securityHeaders['x-content-type-options']) score += 1;
    if (securityHeaders['x-xss-protection']) score += 1;
    if (securityHeaders['referrer-policy']) score += 1;
    
    // Modern security headers
    if (securityHeaders['permissions-policy'] || securityHeaders['feature-policy']) score += 1;
    if (securityHeaders['cross-origin-embedder-policy']) score += 0.5;
    if (securityHeaders['cross-origin-opener-policy']) score += 0.5;
    if (securityHeaders['cross-origin-resource-policy']) score += 0.5;
    
    // Advanced security headers
    if (securityHeaders['expect-ct']) score += 0.5;
    if (securityHeaders['public-key-pins']) score += 0.5;
    if (securityHeaders['x-permitted-cross-domain-policies']) score += 0.5;
    if (securityHeaders['x-download-options']) score += 0.5;
    
    return Math.round((score / maxScore) * 100);
}

function generateSecurityRecommendations(securityHeaders) {
    const recommendations = [];
    
    if (!securityHeaders['content-security-policy']) {
        recommendations.push('Implement Content Security Policy (CSP) to prevent XSS attacks');
    }
    if (!securityHeaders['strict-transport-security']) {
        recommendations.push('Add HSTS header to enforce HTTPS connections');
    }
    if (!securityHeaders['x-frame-options']) {
        recommendations.push('Add X-Frame-Options to prevent clickjacking attacks');
    }
    if (!securityHeaders['x-content-type-options']) {
        recommendations.push('Add X-Content-Type-Options: nosniff to prevent MIME type sniffing');
    }
    
    return recommendations;
}

function extractServerInfo(headers) {
    return {
        server: headers['server'] || 'Unknown',
        poweredBy: headers['x-powered-by'] || null,
        technology: headers['x-technology'] || null,
        generator: headers['generator'] || null,
        framework: headers['x-framework'] || null,
        aspNetVersion: headers['x-aspnet-version'] || null,
        aspNetMvcVersion: headers['x-aspnetmvc-version'] || null,
        runtime: headers['x-runtime'] || null,
        sourceMap: headers['sourcemap'] || headers['x-sourcemap'] || null,
        loadBalancer: headers['x-served-by'] || headers['x-cache'] || headers['x-varnish'] || null,
        cdn: extractCDNInfo(headers),
        webServer: extractWebServerInfo(headers),
        applicationServer: extractAppServerInfo(headers)
    };
}

function extractCDNInfo(headers) {
    const cdnHeaders = [];
    if (headers['cf-ray']) cdnHeaders.push('Cloudflare');
    if (headers['x-amz-cf-id']) cdnHeaders.push('Amazon CloudFront');
    if (headers['x-azure-ref']) cdnHeaders.push('Azure CDN');
    if (headers['x-fastly-request-id']) cdnHeaders.push('Fastly');
    if (headers['x-cache'] && headers['x-cache'].includes('maxcdn')) cdnHeaders.push('MaxCDN');
    if (headers['x-served-by'] && headers['x-served-by'].includes('cache')) cdnHeaders.push('Varnish Cache');
    return cdnHeaders.length > 0 ? cdnHeaders.join(', ') : null;
}

function extractWebServerInfo(headers) {
    const server = headers['server'];
    if (!server) return null;
    
    const serverInfo = [];
    if (server.includes('nginx')) serverInfo.push('Nginx');
    if (server.includes('Apache')) serverInfo.push('Apache');
    if (server.includes('IIS')) serverInfo.push('Microsoft IIS');
    if (server.includes('LiteSpeed')) serverInfo.push('LiteSpeed');
    if (server.includes('Caddy')) serverInfo.push('Caddy');
    if (server.includes('Traefik')) serverInfo.push('Traefik');
    
    return serverInfo.length > 0 ? serverInfo.join(', ') : server;
}

function extractAppServerInfo(headers) {
    const appServers = [];
    if (headers['x-powered-by']) {
        const poweredBy = headers['x-powered-by'].toLowerCase();
        if (poweredBy.includes('php')) appServers.push('PHP');
        if (poweredBy.includes('asp.net')) appServers.push('ASP.NET');
        if (poweredBy.includes('express')) appServers.push('Express.js');
        if (poweredBy.includes('django')) appServers.push('Django');
        if (poweredBy.includes('rails')) appServers.push('Ruby on Rails');
    }
    return appServers.length > 0 ? appServers.join(', ') : null;
}

function analyzeCookies(headers) {
    const setCookieHeaders = [];
    const cookieIssues = [];
    
    // Get all Set-Cookie headers
    Object.keys(headers).forEach(key => {
        if (key.toLowerCase() === 'set-cookie') {
            const cookieValue = headers[key];
            setCookieHeaders.push(cookieValue);
            
            // Analyze cookie security
            const cookieLower = cookieValue.toLowerCase();
            if (!cookieLower.includes('secure')) {
                cookieIssues.push('Cookie without Secure flag detected');
            }
            if (!cookieLower.includes('httponly')) {
                cookieIssues.push('Cookie without HttpOnly flag detected');
            }
            if (!cookieLower.includes('samesite')) {
                cookieIssues.push('Cookie without SameSite attribute detected');
            }
            if (cookieLower.includes('samesite=none')) {
                cookieIssues.push('Cookie with SameSite=None detected (potential CSRF risk)');
            }
        }
    });
    
    return {
        cookieCount: setCookieHeaders.length,
        cookies: setCookieHeaders,
        securityIssues: [...new Set(cookieIssues)] // Remove duplicates
    };
}

function analyzeInfoDisclosure(headers) {
    const disclosures = [];
    const sensitiveHeaders = [
        'server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version',
        'x-generator', 'x-runtime', 'x-version', 'x-framework'
    ];
    
    sensitiveHeaders.forEach(headerName => {
        if (headers[headerName]) {
            disclosures.push({
                header: headerName,
                value: headers[headerName],
                risk: 'Information disclosure',
                description: `Reveals ${headerName.replace('x-', '').replace('-', ' ')} information`
            });
        }
    });
    
    // Check for development/debug headers
    const debugHeaders = [
        'x-debug', 'x-debug-token', 'x-drupal-cache', 'x-drupal-dynamic-cache',
        'x-cache-debug', 'x-varnish-debug', 'x-debug-mode'
    ];
    
    debugHeaders.forEach(headerName => {
        if (headers[headerName]) {
            disclosures.push({
                header: headerName,
                value: headers[headerName],
                risk: 'Debug information exposure',
                description: 'Debug headers should not be present in production'
            });
        }
    });
    
    // Check for source map references
    if (headers['sourcemap'] || headers['x-sourcemap']) {
        disclosures.push({
            header: 'sourcemap',
            value: headers['sourcemap'] || headers['x-sourcemap'],
            risk: 'Source code exposure',
            description: 'Source maps can reveal application structure and code'
        });
    }
    
    return disclosures;
}

function analyzeCachingHeaders(headers) {
    const caching = {
        cacheControl: headers['cache-control'] || null,
        expires: headers['expires'] || null,
        etag: headers['etag'] || null,
        lastModified: headers['last-modified'] || null,
        pragma: headers['pragma'] || null,
        vary: headers['vary'] || null,
        issues: []
    };
    
    // Analyze cache control issues
    if (!caching.cacheControl) {
        caching.issues.push('No Cache-Control header found');
    } else {
        const cc = caching.cacheControl.toLowerCase();
        if (cc.includes('public') && !cc.includes('max-age')) {
            caching.issues.push('Public cache without max-age may cause indefinite caching');
        }
        if (cc.includes('no-cache') && cc.includes('no-store')) {
            caching.issues.push('Both no-cache and no-store present (redundant)');
        }
    }
    
    // Check for cache poisoning risks
    if (caching.vary && caching.vary.toLowerCase().includes('user-agent')) {
        caching.issues.push('Caching based on User-Agent header (potential cache poisoning)');
    }
    
    return caching;
}

// Technology Stack Detector Implementation
async function analyzeTechnology(url, tabId) {
    try {
        // Get technology information from content script
        const techData = await chrome.tabs.sendMessage(tabId, {
            action: 'detectTechnology'
        });
        
        // Combine with header-based detection
        const response = await fetch(url, { method: 'HEAD' });
        const headers = {};
        for (const [key, value] of response.headers.entries()) {
            headers[key] = value;
        }
        
        const headerTech = detectTechnologyFromHeaders(headers);
        
        // Merge results
        const combined = mergeTechnologyData(techData || {}, headerTech);
        
        return {
            ...combined,
            url,
            analyzedAt: new Date().toISOString()
        };
        
    } catch (error) {
        // Fallback to header-only analysis
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const headers = {};
            for (const [key, value] of response.headers.entries()) {
                headers[key] = value;
            }
            
            return {
                ...detectTechnologyFromHeaders(headers),
                url,
                analyzedAt: new Date().toISOString(),
                note: 'Limited analysis - content script unavailable'
            };
        } catch (fallbackError) {
            throw new Error('Could not detect technologies: ' + error.message);
        }
    }
}

function detectTechnologyFromHeaders(headers) {
    const technologies = {
        server: [],
        framework: [],
        cms: [],
        analytics: [],
        other: []
    };
    
    // Server detection
    if (headers['server']) {
        const server = headers['server'].toLowerCase();
        if (server.includes('apache')) technologies.server.push('Apache');
        if (server.includes('nginx')) technologies.server.push('Nginx');
        if (server.includes('iis')) technologies.server.push('IIS');
        if (server.includes('cloudflare')) technologies.server.push('Cloudflare');
    }
    
    // Framework detection
    if (headers['x-powered-by']) {
        const poweredBy = headers['x-powered-by'].toLowerCase();
        if (poweredBy.includes('asp.net')) technologies.framework.push('ASP.NET');
        if (poweredBy.includes('php')) technologies.framework.push('PHP');
        if (poweredBy.includes('express')) technologies.framework.push('Express.js');
    }
    
    // CMS detection
    if (headers['x-generator']) {
        const generator = headers['x-generator'].toLowerCase();
        if (generator.includes('wordpress')) technologies.cms.push('WordPress');
        if (generator.includes('drupal')) technologies.cms.push('Drupal');
        if (generator.includes('joomla')) technologies.cms.push('Joomla');
    }
    
    return technologies;
}

function mergeTechnologyData(contentData, headerData) {
    const merged = {
        server: [...(contentData.server || []), ...(headerData.server || [])],
        framework: [...(contentData.framework || []), ...(headerData.framework || [])],
        cms: [...(contentData.cms || []), ...(headerData.cms || [])],
        analytics: [...(contentData.analytics || []), ...(headerData.analytics || [])],
        javascript: contentData.javascript || [],
        css: contentData.css || [],
        fonts: contentData.fonts || [],
        security: contentData.security || [],
        development: contentData.development || [],
        cdn: contentData.cdn || [],
        other: [...(contentData.other || []), ...(headerData.other || [])]
    };
    
    // Remove duplicates
    Object.keys(merged).forEach(key => {
        merged[key] = [...new Set(merged[key])];
    });
    
    return merged;
}

// Certificate Analyzer Implementation
async function analyzeCertificate(url) {
    try {
        const urlObj = new URL(url);
        
        if (urlObj.protocol !== 'https:') {
            return {
                error: 'Site does not use HTTPS',
                url,
                analyzedAt: new Date().toISOString()
            };
        }
        
        // Get certificate information using fetch and examining the response
        const response = await fetch(url, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        
        // Basic certificate analysis from headers
        const certificateInfo = {
            url,
            protocol: 'HTTPS',
            domain: urlObj.hostname,
            port: urlObj.port || 443,
            headers: extractSecurityHeaders(response),
            analyzedAt: new Date().toISOString(),
            note: 'Certificate details require enhanced permissions'
        };
        
        // Check for HSTS
        const hstsHeader = response.headers.get('strict-transport-security');
        if (hstsHeader) {
            certificateInfo.hsts = {
                enabled: true,
                header: hstsHeader,
                maxAge: extractMaxAge(hstsHeader),
                includeSubDomains: hstsHeader.includes('includeSubDomains'),
                preload: hstsHeader.includes('preload')
            };
        } else {
            certificateInfo.hsts = { enabled: false };
        }
        
        return certificateInfo;
        
    } catch (error) {
        return {
            error: error.message,
            url,
            analyzedAt: new Date().toISOString()
        };
    }
}

function extractSecurityHeaders(response) {
    const securityHeaders = {};
    
    const relevantHeaders = [
        'strict-transport-security',
        'public-key-pins',
        'expect-ct',
        'certificate-transparency'
    ];
    
    relevantHeaders.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
            securityHeaders[header] = value;
        }
    });
    
    return securityHeaders;
}

function extractMaxAge(hstsHeader) {
    const maxAgeMatch = hstsHeader.match(/max-age=(\d+)/);
    if (maxAgeMatch) {
        const seconds = parseInt(maxAgeMatch[1]);
        const days = Math.floor(seconds / (60 * 60 * 24));
        return { seconds, days };
    }
    return null;
}

// Utility functions
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Error handling
chrome.runtime.onStartup.addListener(() => {
    console.log('PenTest Assistant background script started');
});

chrome.runtime.onSuspend.addListener(() => {
    console.log('PenTest Assistant background script suspended');
}); 