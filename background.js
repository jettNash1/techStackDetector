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
        
        // Generate Burp Suite recommendations
        const burpRecommendations = generateBurpRecommendations({
            headers,
            securityHeaders,
            serverInfo,
            responseInfo,
            cookieAnalysis,
            infoDisclosure,
            cachingHeaders
        }, url);
        
        return {
            headers,
            securityHeaders,
            serverInfo,
            responseInfo,
            cookieAnalysis,
            infoDisclosure,
            cachingHeaders,
            burpRecommendations,
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

function generateBurpRecommendations(analysisData, url) {
    const recommendations = {
        highPriority: [],
        mediumPriority: [],
        lowPriority: [],
        burpExtensions: [],
        scannerConfig: [],
        manualTesting: []
    };
    
    const { headers, securityHeaders, serverInfo, cookieAnalysis, infoDisclosure, cachingHeaders } = analysisData;
    
    // Security Headers Analysis for Burp
    analyzeSecurityHeadersForBurp(securityHeaders, recommendations);
    
    // Server Information Analysis for Burp
    analyzeServerInfoForBurp(serverInfo, recommendations);
    
    // Cookie Security Analysis for Burp
    analyzeCookiesForBurp(cookieAnalysis, recommendations);
    
    // Information Disclosure Analysis for Burp
    analyzeInfoDisclosureForBurp(infoDisclosure, recommendations);
    
    // Caching Analysis for Burp
    analyzeCachingForBurp(cachingHeaders, recommendations);
    
    // Technology-specific recommendations
    analyzeTechnologiesForBurp(serverInfo, recommendations);
    
    return recommendations;
}

function analyzeSecurityHeadersForBurp(securityHeaders, recommendations) {
    if (!securityHeaders?.headers) return;
    
    const headers = securityHeaders.headers;
    
    // CSP Analysis
    if (!headers['content-security-policy']) {
        recommendations.highPriority.push({
            category: 'Content Security Policy',
            risk: 'XSS/Code Injection',
            description: 'No CSP header detected - high risk of XSS attacks',
            burpTechnique: 'Use Burp Scanner with XSS payloads, test script injection in all parameters',
            extensions: ['Reflected Parameters', 'XSS Validator', 'CSP Bypass'],
            scannerConfig: 'Enable all XSS checks, increase payload variations'
        });
    } else if (headers['content-security-policy']) {
        const csp = headers['content-security-policy'].toLowerCase();
        if (csp.includes("'unsafe-inline'")) {
            recommendations.mediumPriority.push({
                category: 'Content Security Policy',
                risk: 'XSS/Script Injection',
                description: "CSP allows 'unsafe-inline' - XSS bypass possible",
                burpTechnique: "Test inline script injection, use CSP Evaluator extension",
                extensions: ['CSP Bypass', 'XSS Validator'],
                scannerConfig: 'Focus on DOM-based XSS payloads'
            });
        }
        if (csp.includes("'unsafe-eval'")) {
            recommendations.mediumPriority.push({
                category: 'Content Security Policy',
                risk: 'Code Injection',
                description: "CSP allows 'unsafe-eval' - code execution possible",
                burpTechnique: "Test eval() injection, JSON injection, template injection",
                extensions: ['JSON Beautifier', 'Template Injector'],
                scannerConfig: 'Enable template injection checks'
            });
        }
    }
    
    // HSTS Analysis
    if (!headers['strict-transport-security']) {
        recommendations.mediumPriority.push({
            category: 'Transport Security',
            risk: 'Man-in-the-Middle',
            description: 'No HSTS header - SSL stripping attacks possible',
            burpTechnique: 'Test HTTP endpoints, check for mixed content, use SSL Kill Switch',
            extensions: ['SSL Kill Switch 2', 'Certificate Pinning Bypass'],
            scannerConfig: 'Test both HTTP and HTTPS endpoints'
        });
    }
    
    // Clickjacking Protection
    if (!headers['x-frame-options'] && !headers['content-security-policy']?.includes('frame-ancestors')) {
        recommendations.mediumPriority.push({
            category: 'Clickjacking',
            risk: 'UI Redressing',
            description: 'No clickjacking protection detected',
            burpTechnique: 'Create iframe PoC, test X-Frame-Options bypass techniques',
            extensions: ['Clickjacking PoC Generator'],
            manualTesting: 'Create HTML page with iframe pointing to target'
        });
    }
    
    // MIME Sniffing
    if (!headers['x-content-type-options']) {
        recommendations.lowPriority.push({
            category: 'MIME Security',
            risk: 'MIME Confusion',
            description: 'No X-Content-Type-Options header - MIME sniffing possible',
            burpTechnique: 'Upload files with mismatched MIME types, test polyglot files',
            extensions: ['Upload Scanner', 'File Upload Vulnerabilities'],
            scannerConfig: 'Enable file upload vulnerability checks'
        });
    }
}

function analyzeServerInfoForBurp(serverInfo, recommendations) {
    if (!serverInfo) return;
    
    // Version Information Disclosure
    if (serverInfo.server && serverInfo.server !== 'Unknown') {
        recommendations.lowPriority.push({
            category: 'Information Disclosure',
            risk: 'Reconnaissance',
            description: `Server version disclosed: ${serverInfo.server}`,
            burpTechnique: 'Search for known vulnerabilities in this server version',
            extensions: ['Vulners Scanner', 'Software Version Reporter'],
            manualTesting: 'Check CVE databases for server version vulnerabilities'
        });
    }
    
    // PHP Version Detection
    if (serverInfo.poweredBy?.includes('PHP')) {
        recommendations.mediumPriority.push({
            category: 'PHP Security',
            risk: 'Code Injection',
            description: 'PHP detected - test for PHP-specific vulnerabilities',
            burpTechnique: 'Test PHP injection, file inclusion (LFI/RFI), PHP deserialization',
            extensions: ['PHP Object Injection Check', 'LFI/RFI Scanner'],
            scannerConfig: 'Enable PHP injection checks, file inclusion tests'
        });
    }
    
    // ASP.NET Detection
    if (serverInfo.aspNetVersion) {
        recommendations.mediumPriority.push({
            category: 'ASP.NET Security',
            risk: 'Framework Vulnerabilities',
            description: `ASP.NET version disclosed: ${serverInfo.aspNetVersion}`,
            burpTechnique: 'Test ViewState tampering, .NET deserialization, debug traces',
            extensions: ['ViewState Editor', '.NET Beautifier'],
            scannerConfig: 'Enable .NET specific checks'
        });
    }
    
    // CDN Detection
    if (serverInfo.cdn) {
        recommendations.lowPriority.push({
            category: 'CDN Security',
            risk: 'Cache Poisoning',
            description: `CDN detected: ${serverInfo.cdn}`,
            burpTechnique: 'Test cache poisoning, host header injection, CDN bypass',
            extensions: ['Cache Poisoning Scanner', 'Host Header Injection'],
            manualTesting: 'Test X-Forwarded-Host, X-Original-IP headers'
        });
    }
}

function analyzeCookiesForBurp(cookieAnalysis, recommendations) {
    if (!cookieAnalysis || cookieAnalysis.cookieCount === 0) return;
    
    if (cookieAnalysis.securityIssues?.length > 0) {
        cookieAnalysis.securityIssues.forEach(issue => {
            if (issue.includes('Secure flag')) {
                recommendations.mediumPriority.push({
                    category: 'Cookie Security',
                    risk: 'Session Hijacking',
                    description: 'Cookies without Secure flag detected',
                    burpTechnique: 'Intercept cookies over HTTP, test session fixation',
                    extensions: ['Cookie Jar', 'Session Timeout Test'],
                    scannerConfig: 'Enable session management tests'
                });
            }
            
            if (issue.includes('HttpOnly')) {
                recommendations.mediumPriority.push({
                    category: 'Cookie Security',
                    risk: 'XSS Cookie Theft',
                    description: 'Cookies without HttpOnly flag - XSS can steal sessions',
                    burpTechnique: 'Test XSS with document.cookie payloads',
                    extensions: ['XSS Validator', 'Cookie Jar'],
                    manualTesting: 'Inject <script>alert(document.cookie)</script>'
                });
            }
            
            if (issue.includes('SameSite')) {
                recommendations.highPriority.push({
                    category: 'CSRF Protection',
                    risk: 'Cross-Site Request Forgery',
                    description: 'Cookies without SameSite protection - CSRF possible',
                    burpTechnique: 'Generate CSRF PoCs, test cross-origin requests',
                    extensions: ['CSRF PoC Generator', 'CSRF Scanner'],
                    scannerConfig: 'Enable CSRF detection checks'
                });
            }
        });
    }
}

function analyzeInfoDisclosureForBurp(infoDisclosure, recommendations) {
    if (!infoDisclosure?.length) return;
    
    infoDisclosure.forEach(disclosure => {
        if (disclosure.risk.includes('Debug')) {
            recommendations.highPriority.push({
                category: 'Debug Information',
                risk: 'Information Disclosure',
                description: `Debug headers detected: ${disclosure.header}`,
                burpTechnique: 'Test debug parameters, error message enumeration',
                extensions: ['Error Message Checks', 'Debug Info Scanner'],
                manualTesting: 'Add ?debug=1, ?test=1 parameters to requests'
            });
        }
        
        if (disclosure.risk.includes('Source')) {
            recommendations.highPriority.push({
                category: 'Source Code Exposure',
                risk: 'Code Analysis',
                description: 'Source maps detected - code structure exposed',
                burpTechnique: 'Download source maps, analyze exposed source code',
                extensions: ['Source Map Extractor'],
                manualTesting: 'Access .map files directly, analyze revealed paths'
            });
        }
    });
}

function analyzeCachingForBurp(cachingHeaders, recommendations) {
    if (!cachingHeaders?.issues?.length) return;
    
    cachingHeaders.issues.forEach(issue => {
        if (issue.includes('User-Agent')) {
            recommendations.mediumPriority.push({
                category: 'Cache Poisoning',
                risk: 'Web Cache Deception',
                description: 'Cache varies on User-Agent - poisoning possible',
                burpTechnique: 'Test cache poisoning with malicious User-Agent headers',
                extensions: ['Cache Poisoning Scanner', 'Param Miner'],
                scannerConfig: 'Enable cache poisoning detection'
            });
        }
        
        if (issue.includes('max-age')) {
            recommendations.lowPriority.push({
                category: 'Cache Behavior',
                risk: 'Cache Issues',
                description: 'Problematic cache configuration detected',
                burpTechnique: 'Test cache behavior with different headers',
                extensions: ['Cache Analyzer'],
                manualTesting: 'Test with different Cache-Control headers'
            });
        }
    });
}

function analyzeTechnologiesForBurp(serverInfo, recommendations) {
    // Add common Burp extensions for any web application
    recommendations.burpExtensions.push(
        'Active Scan++',
        'Param Miner',
        'Collaborator Everywhere',
        'Backslash Powered Scanner',
        'J2EEScan',
        'Software Vulnerability Scanner',
        'Retire.js',
        'CSP Auditor'
    );
    
    // Add scanner configuration recommendations
    recommendations.scannerConfig.push(
        'Enable all injection checks',
        'Configure custom insertion points',
        'Set up Collaborator for out-of-band testing',
        'Enable JavaScript analysis',
        'Configure session handling rules'
    );
    
    // Add manual testing recommendations
    recommendations.manualTesting.push(
        'Spider the application thoroughly',
        'Test all input parameters manually',
        'Check for hidden/backup files',
        'Test HTTP methods (OPTIONS, PUT, DELETE)',
        'Examine robots.txt and sitemap.xml',
        'Test for admin interfaces'
    );
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
        
        // Generate Burp Suite recommendations for technology stack
        const burpRecommendations = generateTechBurpRecommendations(combined, url);
        
        return {
            ...combined,
            burpRecommendations,
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
        
        // Generate Burp Suite recommendations for certificate analysis
        certificateInfo.burpRecommendations = generateCertBurpRecommendations(certificateInfo, url);
        
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

function generateTechBurpRecommendations(technologies, url) {
    const recommendations = {
        highPriority: [],
        mediumPriority: [],
        lowPriority: [],
        burpExtensions: [],
        scannerConfig: [],
        manualTesting: []
    };
    
    // Analyze each technology category
    analyzeFrameworksForBurp(technologies.framework || [], recommendations);
    analyzeJavaScriptForBurp(technologies.javascript || [], recommendations);
    analyzeCMSForBurp(technologies.cms || [], recommendations);
    analyzeSecurityToolsForBurp(technologies.security || [], recommendations);
    analyzeDevelopmentToolsForBurp(technologies.development || [], recommendations);
    
    // Add general recommendations
    addGeneralTechRecommendations(recommendations);
    
    return recommendations;
}

function analyzeFrameworksForBurp(frameworks, recommendations) {
    frameworks.forEach(framework => {
        const lowerFramework = framework.toLowerCase();
        
        if (lowerFramework.includes('react')) {
            recommendations.mediumPriority.push({
                category: 'React Framework',
                risk: 'Client-Side Vulnerabilities',
                description: 'React application detected',
                burpTechnique: 'Test for DOM-based XSS, client-side template injection, React prop pollution',
                extensions: ['DOM Invader', 'XSS Validator', 'JavaScript Security Scanner'],
                scannerConfig: 'Enable DOM-based vulnerability scanning'
            });
        }
        
        if (lowerFramework.includes('angular')) {
            recommendations.mediumPriority.push({
                category: 'Angular Framework',
                risk: 'Template Injection',
                description: 'Angular application detected',
                burpTechnique: 'Test Angular template injection, CSP bypass, client-side routing vulnerabilities',
                extensions: ['Template Injector', 'AngularJS CSTI Scanner'],
                scannerConfig: 'Enable template injection checks'
            });
        }
        
        if (lowerFramework.includes('vue')) {
            recommendations.mediumPriority.push({
                category: 'Vue.js Framework',
                risk: 'Client-Side Injection',
                description: 'Vue.js application detected',
                burpTechnique: 'Test Vue template injection, v-html XSS, client-side routing issues',
                extensions: ['Template Injector', 'DOM Invader'],
                scannerConfig: 'Enable client-side template injection scanning'
            });
        }
        
        if (lowerFramework.includes('express')) {
            recommendations.mediumPriority.push({
                category: 'Express.js Framework',
                risk: 'Server-Side Vulnerabilities',
                description: 'Express.js backend detected',
                burpTechnique: 'Test for prototype pollution, NoSQL injection, server-side template injection',
                extensions: ['Node.js Security Scanner', 'NoSQL Injection'],
                scannerConfig: 'Enable NoSQL injection and prototype pollution checks'
            });
        }
        
        if (lowerFramework.includes('django')) {
            recommendations.mediumPriority.push({
                category: 'Django Framework',
                risk: 'Python-Specific Vulnerabilities',
                description: 'Django framework detected',
                burpTechnique: 'Test Django debug pages, CSRF token bypass, pickle deserialization',
                extensions: ['Python Security Scanner', 'Django Debug Scanner'],
                manualTesting: 'Check for debug=True, admin interface exposure'
            });
        }
    });
}

function analyzeJavaScriptForBurp(jsLibraries, recommendations) {
    jsLibraries.forEach(library => {
        const lowerLib = library.toLowerCase();
        
        if (lowerLib.includes('jquery')) {
            recommendations.lowPriority.push({
                category: 'jQuery Library',
                risk: 'DOM Manipulation',
                description: 'jQuery detected - check for DOM-based vulnerabilities',
                burpTechnique: 'Test jQuery selectors for XSS, DOM manipulation attacks',
                extensions: ['DOM Invader', 'Reflected Parameters'],
                scannerConfig: 'Focus on DOM-based XSS patterns'
            });
        }
        
        if (lowerLib.includes('socket.io')) {
            recommendations.highPriority.push({
                category: 'WebSocket Security',
                risk: 'Real-time Communication',
                description: 'Socket.io detected - WebSocket vulnerabilities possible',
                burpTechnique: 'Test WebSocket injection, message tampering, authentication bypass',
                extensions: ['WebSocket Security Scanner', 'Socket.io Tester'],
                manualTesting: 'Intercept and modify WebSocket messages'
            });
        }
        
        if (lowerLib.includes('axios')) {
            recommendations.lowPriority.push({
                category: 'HTTP Client',
                risk: 'Request Manipulation',
                description: 'Axios HTTP client detected',
                burpTechnique: 'Test for CSRF, request smuggling, header injection',
                extensions: ['HTTP Request Smuggler', 'CSRF Scanner'],
                scannerConfig: 'Enable HTTP smuggling detection'
            });
        }
    });
}

function analyzeCMSForBurp(cmsplatforms, recommendations) {
    cmsplatforms.forEach(cms => {
        const lowerCMS = cms.toLowerCase();
        
        if (lowerCMS.includes('wordpress')) {
            recommendations.highPriority.push({
                category: 'WordPress CMS',
                risk: 'CMS-Specific Vulnerabilities',
                description: 'WordPress detected - high-value target',
                burpTechnique: 'Enumerate plugins/themes, test wp-admin, XML-RPC attacks, file upload',
                extensions: ['WordPress Security Scanner', 'WPScan Passive Scanner'],
                manualTesting: 'Check /wp-admin, /wp-content/uploads, xmlrpc.php'
            });
        }
        
        if (lowerCMS.includes('drupal')) {
            recommendations.mediumPriority.push({
                category: 'Drupal CMS',
                risk: 'CMS Vulnerabilities',
                description: 'Drupal detected',
                burpTechnique: 'Test for Drupalgeddon vulnerabilities, admin interface enumeration',
                extensions: ['Drupal Security Scanner'],
                manualTesting: 'Check /admin, /user, module enumeration'
            });
        }
        
        if (lowerCMS.includes('joomla')) {
            recommendations.mediumPriority.push({
                category: 'Joomla CMS',
                risk: 'CMS Vulnerabilities',
                description: 'Joomla detected',
                burpTechnique: 'Test administrator interface, component vulnerabilities',
                extensions: ['Joomla Security Scanner'],
                manualTesting: 'Check /administrator, component enumeration'
            });
        }
    });
}

function analyzeSecurityToolsForBurp(securityTools, recommendations) {
    securityTools.forEach(tool => {
        const lowerTool = tool.toLowerCase();
        
        if (lowerTool.includes('recaptcha') || lowerTool.includes('captcha')) {
            recommendations.mediumPriority.push({
                category: 'CAPTCHA Protection',
                risk: 'Automation Prevention',
                description: 'CAPTCHA detected - may limit automated testing',
                burpTechnique: 'Test CAPTCHA bypass, rate limiting, session reuse',
                extensions: ['CAPTCHA Bypass', 'Rate Limiter'],
                manualTesting: 'Test form submission without CAPTCHA solving'
            });
        }
        
        if (lowerTool.includes('cloudflare') && lowerTool.includes('bot')) {
            recommendations.lowPriority.push({
                category: 'Bot Protection',
                risk: 'WAF Evasion',
                description: 'Cloudflare Bot Management detected',
                burpTechnique: 'Test WAF bypass techniques, IP rotation, header manipulation',
                extensions: ['WAF Bypass', 'IP Rotator'],
                scannerConfig: 'Configure request timing and rate limiting'
            });
        }
    });
}

function analyzeDevelopmentToolsForBurp(devTools, recommendations) {
    devTools.forEach(tool => {
        const lowerTool = tool.toLowerCase();
        
        if (lowerTool.includes('webpack') || lowerTool.includes('source map')) {
            recommendations.highPriority.push({
                category: 'Source Maps',
                risk: 'Source Code Exposure',
                description: 'Source maps or Webpack detected - source code may be exposed',
                burpTechnique: 'Download source maps, analyze bundled code structure',
                extensions: ['Source Map Extractor', 'JavaScript Beautifier'],
                manualTesting: 'Access /static/js/*.map, /webpack/ directories'
            });
        }
        
        if (lowerTool.includes('development') || lowerTool.includes('dev')) {
            recommendations.highPriority.push({
                category: 'Development Mode',
                risk: 'Debug Information',
                description: 'Development mode detected - debug information exposed',
                burpTechnique: 'Test debug endpoints, error message enumeration, stack traces',
                extensions: ['Error Message Checks', 'Debug Scanner'],
                manualTesting: 'Add debug parameters, trigger error conditions'
            });
        }
    });
}

function addGeneralTechRecommendations(recommendations) {
    // Add essential Burp extensions for technology assessment
    recommendations.burpExtensions.push(
        'Software Vulnerability Scanner',
        'Retire.js',
        'JavaScript Security Scanner',
        'Wappalyzer',
        'Technology Discovery',
        'CMS Scanner',
        'Framework Detection'
    );
    
    // Add scanner configuration for technology testing
    recommendations.scannerConfig.push(
        'Enable JavaScript analysis',
        'Configure technology-specific payloads',
        'Enable framework-specific checks',
        'Scan for known CVEs in detected technologies'
    );
    
    // Add manual testing for technologies
    recommendations.manualTesting.push(
        'Enumerate technology-specific endpoints',
        'Test default credentials for detected technologies',
        'Check for admin/debug interfaces',
        'Review technology documentation for attack vectors'
    );
}

function generateCertBurpRecommendations(certificateInfo, url) {
    const recommendations = {
        highPriority: [],
        mediumPriority: [],
        lowPriority: [],
        burpExtensions: [],
        scannerConfig: [],
        manualTesting: []
    };
    
    // Analyze certificate configuration
    if (certificateInfo.error) {
        if (certificateInfo.error.includes('HTTPS')) {
            recommendations.highPriority.push({
                category: 'Transport Security',
                risk: 'Insecure Communication',
                description: 'Site does not use HTTPS - all traffic unencrypted',
                burpTechnique: 'Test HTTP endpoints, check for sensitive data transmission',
                extensions: ['SSL Kill Switch 2', 'HTTP History Analyzer'],
                manualTesting: 'Check if sensitive operations are performed over HTTP'
            });
        }
    } else {
        // HSTS Analysis
        if (!certificateInfo.hsts || !certificateInfo.hsts.enabled) {
            recommendations.mediumPriority.push({
                category: 'HSTS Configuration',
                risk: 'SSL Stripping',
                description: 'No HSTS header detected - SSL stripping attacks possible',
                burpTechnique: 'Test mixed content, HTTP to HTTPS redirects, SSL stripping',
                extensions: ['SSL Kill Switch 2', 'Mixed Content Scanner'],
                manualTesting: 'Try accessing HTTP version of pages, check redirects'
            });
        } else {
            if (certificateInfo.hsts.maxAge && certificateInfo.hsts.maxAge.days < 365) {
                recommendations.lowPriority.push({
                    category: 'HSTS Configuration',
                    risk: 'Weak HSTS Policy',
                    description: 'HSTS max-age is less than recommended 1 year',
                    burpTechnique: 'Test HSTS policy enforcement over time',
                    manualTesting: 'Check HSTS header persistence and enforcement'
                });
            }
            
            if (!certificateInfo.hsts.includeSubDomains) {
                recommendations.lowPriority.push({
                    category: 'HSTS Configuration',
                    risk: 'Subdomain SSL Stripping',
                    description: 'HSTS does not include subdomains',
                    burpTechnique: 'Test subdomain enumeration and SSL stripping on subdomains',
                    extensions: ['Subdomain Finder', 'SSL Scanner'],
                    manualTesting: 'Enumerate subdomains and test their SSL configuration'
                });
            }
        }
        
        // Certificate-related security headers
        if (certificateInfo.headers) {
            if (!certificateInfo.headers['public-key-pins'] && !certificateInfo.headers['public-key-pins-report-only']) {
                recommendations.lowPriority.push({
                    category: 'Certificate Pinning',
                    risk: 'Certificate Substitution',
                    description: 'No certificate pinning detected',
                    burpTechnique: 'Test with custom certificates, certificate substitution attacks',
                    extensions: ['Certificate Pinning Bypass', 'Custom Certificate Manager'],
                    manualTesting: 'Test with self-signed certificates'
                });
            }
            
            if (!certificateInfo.headers['expect-ct']) {
                recommendations.lowPriority.push({
                    category: 'Certificate Transparency',
                    risk: 'Certificate Monitoring',
                    description: 'No Certificate Transparency monitoring',
                    burpTechnique: 'Check certificate logs, test certificate substitution',
                    manualTesting: 'Verify certificate in CT logs'
                });
            }
        }
    }
    
    // Add SSL/TLS specific extensions and techniques
    recommendations.burpExtensions.push(
        'SSL Scanner',
        'TLS Attacker',
        'Certificate Pinning Bypass',
        'SSL Kill Switch 2',
        'Certificate Transparency Monitor',
        'HSTS Bypass'
    );
    
    recommendations.scannerConfig.push(
        'Enable SSL/TLS vulnerability scanning',
        'Test both HTTP and HTTPS endpoints',
        'Configure custom certificates for testing',
        'Enable mixed content detection'
    );
    
    recommendations.manualTesting.push(
        'Test certificate validation bypass',
        'Check for certificate chain issues',
        'Test SSL/TLS configuration weaknesses',
        'Verify certificate expiration handling',
        'Test subdomain certificate coverage'
    );
    
    return recommendations;
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