// Headers Results JavaScript

// DOM elements
const analyzedUrlElement = document.getElementById('analyzedUrl');
const analysisTimeElement = document.getElementById('analysisTime');
const loadingContainer = document.getElementById('loadingContainer');
const resultsContainer = document.getElementById('resultsContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const copyAllBtn = document.getElementById('copyAllBtn');
const copyNotification = document.getElementById('copyNotification');
const exportTime = document.getElementById('exportTime');

// State
let currentData = null;
let tabId = null;

// Initialize page
// Theme detection and application - Default to Dark Mode
async function initializeTheme() {
    try {
        // Load saved theme preference
        const result = await chrome.storage.local.get(['theme']);
        const savedTheme = result.theme;
        
        // Determine theme to use - DEFAULT TO DARK MODE
        let theme = savedTheme;
        if (!theme) {
            // Default to dark mode instead of system preference
            theme = 'dark';
        }
        
        // Apply theme
        applyTheme(theme);
        updateThemeToggleIcon(theme);
        
    } catch (error) {
        console.error('Failed to initialize theme:', error);
        // Fallback to dark mode
        applyTheme('dark');
        updateThemeToggleIcon('dark');
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

async function toggleTheme() {
    try {
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        
        // Save preference
        await chrome.storage.local.set({ theme: newTheme });
        
        // Apply theme
        applyTheme(newTheme);
        updateThemeToggleIcon(newTheme);
        
    } catch (error) {
        console.error('Failed to toggle theme:', error);
    }
}

function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeTheme();
    initializePage();
});

async function initializePage() {
    try {
        // Get current tab ID from URL
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        tabId = getCurrentTabId();
        
        if (!tabId) {
            throw new Error('No tab ID found');
        }
        
        // Load data from storage
        const data = await loadResultsData(tabId);
        
        if (!data) {
            throw new Error('No analysis data found');
        }
        
        currentData = data;
        displayResults(data);
        setupEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize page:', error);
        showError(error.message);
    }
}

function getCurrentTabId() {
    // Get tab ID from chrome.tabs API or URL parameters
    try {
        // For extension context, get from current tab
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tabId') || extractTabIdFromStorage();
    } catch (error) {
        // Fallback to getting most recent analysis
        return extractTabIdFromStorage();
    }
}

function extractTabIdFromStorage() {
    // This will be called from loadResultsData with proper tab detection
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs[0]) {
                resolve(tabs[0].id);
            } else {
                resolve(null);
            }
        });
    });
}

async function loadResultsData(tabId) {
    try {
        // Resolve tabId if it's a Promise
        if (tabId && typeof tabId.then === 'function') {
            tabId = await tabId;
        }
        
        // Try direct tab ID first
        if (tabId) {
            const result = await chrome.storage.local.get(`results_${tabId}`);
            if (result[`results_${tabId}`]) {
                return result[`results_${tabId}`];
            }
        }
        
        // Fallback: get all results and find the most recent headers analysis
        const allData = await chrome.storage.local.get(null);
        const resultsKeys = Object.keys(allData).filter(key => key.startsWith('results_'));
        
        let mostRecent = null;
        let mostRecentTime = 0;
        
        for (const key of resultsKeys) {
            const data = allData[key];
            if (data && data.feature === 'headers' && data.timestamp > mostRecentTime) {
                mostRecent = data;
                mostRecentTime = data.timestamp;
            }
        }
        
        return mostRecent;
        
    } catch (error) {
        console.error('Error loading results data:', error);
        return null;
    }
}

function displayResults(data) {
    try {
        // Store URL for retry functionality
        sessionStorage.setItem('analysisUrl', data.originalUrl);
        sessionStorage.setItem('analysisType', 'headers');
        
        // Update header information
        analyzedUrlElement.textContent = data.originalUrl;
        
        const analysisDate = new Date(data.data.analyzedAt || data.timestamp);
        analysisTimeElement.textContent = `Analysis Time: ${analysisDate.toLocaleString()}`;
        
        exportTime.textContent = `Exported: ${new Date().toLocaleString()}`;
        
        // Display security analysis
        displaySecurityAnalysis(data.data.securityHeaders);
        
        // Display all headers
        displayAllHeaders(data.data.headers);
        
        // Display server information
        displayServerInfo(data.data.serverInfo);
        
        // Display response information
        displayResponseInfo(data.data.responseInfo);
        
        // Display cookie analysis
        if (data.data.cookieAnalysis) {
            displayCookieAnalysis(data.data.cookieAnalysis);
        }
        
        // Display information disclosure
        if (data.data.infoDisclosure) {
            displayInfoDisclosure(data.data.infoDisclosure);
        }
        
        // Display caching headers
        if (data.data.cachingHeaders) {
            displayCachingHeaders(data.data.cachingHeaders);
        }
        
        // Display Burp Suite recommendations
        if (data.data.burpRecommendations) {
            displayBurpRecommendations(data.data.burpRecommendations);
        }
        
        // Show results and hide loading
        loadingContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
    } catch (error) {
        console.error('Error displaying results:', error);
        showError('Failed to display analysis results');
    }
}

function displaySecurityAnalysis(securityData) {
    const scoreValue = document.getElementById('scoreValue');
    const securityHeaders = document.getElementById('securityHeaders');
    const recommendations = document.getElementById('recommendations');
    
    // Update security score
    const score = securityData.score || 0;
    scoreValue.textContent = score;
    
    // Update score circle color
    const scoreCircle = document.querySelector('.score-circle');
    const percentage = (score / 100) * 360;
    scoreCircle.style.setProperty('--score-percentage', `${percentage}deg`);
    
    // Display security headers
    securityHeaders.innerHTML = '';
    Object.entries(securityData.headers || {}).forEach(([headerName, value]) => {
        const headerDiv = document.createElement('div');
        headerDiv.className = `security-header ${value ? 'present' : 'missing'}`;
        
        headerDiv.innerHTML = `
            <div>
                <strong>${formatHeaderName(headerName)}</strong>
                ${value ? `<div class="header-value" style="margin-top: 5px; font-size: 12px;">${escapeHtml(value)}</div>` : ''}
            </div>
            <span class="header-status ${value ? 'status-present' : 'status-missing'}">
                ${value ? 'Present' : 'Missing'}
            </span>
        `;
        
        securityHeaders.appendChild(headerDiv);
    });
    
    // Display recommendations
    recommendations.innerHTML = '';
    if (securityData.recommendations && securityData.recommendations.length > 0) {
        securityData.recommendations.forEach(recommendation => {
            const recDiv = document.createElement('div');
            recDiv.className = 'recommendation-item';
            recDiv.innerHTML = `
                <span class="recommendation-icon">⚠️</span>
                <span class="recommendation-text">${escapeHtml(recommendation)}</span>
            `;
            recommendations.appendChild(recDiv);
        });
    } else {
        recommendations.innerHTML = '<div class="recommendation-item"><span class="recommendation-icon">✅</span><span class="recommendation-text">No security recommendations - good security posture!</span></div>';
    }
}

function displayAllHeaders(headers) {
    const allHeaders = document.getElementById('allHeaders');
    allHeaders.innerHTML = '';
    
    if (!headers || Object.keys(headers).length === 0) {
        allHeaders.innerHTML = '<div class="no-headers">No headers found</div>';
        return;
    }
    
    Object.entries(headers).forEach(([name, value]) => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-item';
        headerDiv.innerHTML = `
            <div class="header-name">${escapeHtml(name)}</div>
            <div class="header-value">${escapeHtml(value)}</div>
        `;
        allHeaders.appendChild(headerDiv);
    });
}

function displayServerInfo(serverInfo) {
    const serverInfoEl = document.getElementById('serverInfo');
    serverInfoEl.innerHTML = '';
    
    if (!serverInfo) {
        serverInfoEl.innerHTML = '<div class="no-info">No server information available</div>';
        return;
    }
    
    Object.entries(serverInfo).forEach(([key, value]) => {
        if (value) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info-item';
            infoDiv.innerHTML = `
                <div class="info-label">${formatInfoLabel(key)}</div>
                <div class="info-value">${escapeHtml(value)}</div>
            `;
            serverInfoEl.appendChild(infoDiv);
        }
    });
    
    if (serverInfoEl.children.length === 0) {
        serverInfoEl.innerHTML = '<div class="no-info">No server information available</div>';
    }
}

function displayResponseInfo(responseInfo) {
    const responseInfoEl = document.getElementById('responseInfo');
    responseInfoEl.innerHTML = '';
    
    if (!responseInfo) {
        responseInfoEl.innerHTML = '<div class="no-info">No response information available</div>';
        return;
    }
    
    Object.entries(responseInfo).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info-item';
            infoDiv.innerHTML = `
                <div class="info-label">${formatInfoLabel(key)}</div>
                <div class="info-value">${escapeHtml(String(value))}</div>
            `;
            responseInfoEl.appendChild(infoDiv);
        }
    });
}

function displayCookieAnalysis(cookieData) {
    const cookieSection = document.getElementById('cookieSection');
    const cookieAnalysis = document.getElementById('cookieAnalysis');
    
    cookieAnalysis.innerHTML = '';
    
    // Cookie count summary
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'cookie-summary';
    summaryDiv.innerHTML = `
        <div class="summary-item">
            <span class="summary-count">${cookieData.cookieCount}</span>
            <span class="summary-label">Cookies Found</span>
        </div>
    `;
    cookieAnalysis.appendChild(summaryDiv);
    
    // Security issues
    if (cookieData.securityIssues && cookieData.securityIssues.length > 0) {
        const issuesDiv = document.createElement('div');
        issuesDiv.className = 'cookie-issues';
        issuesDiv.innerHTML = '<h4>🚨 Security Issues</h4>';
        
        cookieData.securityIssues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = 'security-issue';
            issueDiv.innerHTML = `
                <span class="issue-icon">⚠️</span>
                <span class="issue-text">${escapeHtml(issue)}</span>
            `;
            issuesDiv.appendChild(issueDiv);
        });
        cookieAnalysis.appendChild(issuesDiv);
    }
    
    // Individual cookies
    if (cookieData.cookies && cookieData.cookies.length > 0) {
        const cookiesDiv = document.createElement('div');
        cookiesDiv.className = 'cookie-list';
        cookiesDiv.innerHTML = '<h4>🍪 Cookie Details</h4>';
        
        cookieData.cookies.forEach((cookie, index) => {
            const cookieDiv = document.createElement('div');
            cookieDiv.className = 'cookie-item';
            cookieDiv.innerHTML = `
                <div class="cookie-header">Cookie ${index + 1}</div>
                <div class="cookie-value">${escapeHtml(cookie)}</div>
            `;
            cookiesDiv.appendChild(cookieDiv);
        });
        cookieAnalysis.appendChild(cookiesDiv);
    }
    
    if (cookieData.cookieCount === 0) {
        cookieAnalysis.innerHTML = '<div class="no-cookies">No cookies found</div>';
    }
    
    cookieSection.style.display = 'block';
}

function displayInfoDisclosure(disclosures) {
    const infoSection = document.getElementById('infoDisclosureSection');
    const infoDisclosure = document.getElementById('infoDisclosure');
    
    infoDisclosure.innerHTML = '';
    
    if (!disclosures || disclosures.length === 0) {
        infoDisclosure.innerHTML = '<div class="no-disclosure">No information disclosure detected</div>';
        infoSection.style.display = 'block';
        return;
    }
    
    disclosures.forEach(disclosure => {
        const disclosureDiv = document.createElement('div');
        disclosureDiv.className = 'disclosure-item';
        
        let riskClass = 'risk-low';
        if (disclosure.risk.includes('Debug') || disclosure.risk.includes('Source')) {
            riskClass = 'risk-high';
        } else if (disclosure.risk.includes('Information')) {
            riskClass = 'risk-medium';
        }
        
        disclosureDiv.innerHTML = `
            <div class="disclosure-header">
                <span class="disclosure-header-name">${escapeHtml(disclosure.header)}</span>
                <span class="risk-badge ${riskClass}">${escapeHtml(disclosure.risk)}</span>
            </div>
            <div class="disclosure-value">${escapeHtml(disclosure.value)}</div>
            <div class="disclosure-description">${escapeHtml(disclosure.description)}</div>
        `;
        infoDisclosure.appendChild(disclosureDiv);
    });
    
    infoSection.style.display = 'block';
}

function displayCachingHeaders(cachingData) {
    const cachingSection = document.getElementById('cachingSection');
    const cachingHeaders = document.getElementById('cachingHeaders');
    
    cachingHeaders.innerHTML = '';
    
    // Caching headers
    const headersDiv = document.createElement('div');
    headersDiv.className = 'caching-headers-list';
    
    const headersList = [
        { key: 'cacheControl', label: 'Cache-Control' },
        { key: 'expires', label: 'Expires' },
        { key: 'etag', label: 'ETag' },
        { key: 'lastModified', label: 'Last-Modified' },
        { key: 'pragma', label: 'Pragma' },
        { key: 'vary', label: 'Vary' }
    ];
    
    headersList.forEach(header => {
        if (cachingData[header.key]) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'caching-header-item';
            headerDiv.innerHTML = `
                <div class="header-name">${header.label}</div>
                <div class="header-value">${escapeHtml(cachingData[header.key])}</div>
            `;
            headersDiv.appendChild(headerDiv);
        }
    });
    
    if (headersDiv.children.length > 0) {
        cachingHeaders.appendChild(headersDiv);
    }
    
    // Caching issues
    if (cachingData.issues && cachingData.issues.length > 0) {
        const issuesDiv = document.createElement('div');
        issuesDiv.className = 'caching-issues';
        issuesDiv.innerHTML = '<h4>⚠️ Caching Issues</h4>';
        
        cachingData.issues.forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.className = 'caching-issue';
            issueDiv.innerHTML = `
                <span class="issue-icon">🔍</span>
                <span class="issue-text">${escapeHtml(issue)}</span>
            `;
            issuesDiv.appendChild(issueDiv);
        });
        cachingHeaders.appendChild(issuesDiv);
    }
    
    if (headersDiv.children.length === 0 && (!cachingData.issues || cachingData.issues.length === 0)) {
        cachingHeaders.innerHTML = '<div class="no-caching">No caching headers found</div>';
    }
    
    cachingSection.style.display = 'block';
}

function displayBurpRecommendations(burpData) {
    const burpSection = document.getElementById('burpRecommendationsSection');
    const burpRecommendations = document.getElementById('burpRecommendations');
    
    burpRecommendations.innerHTML = '';
    
    // Check if there are any recommendations
    const hasRecommendations = (burpData.highPriority && burpData.highPriority.length > 0) ||
                              (burpData.mediumPriority && burpData.mediumPriority.length > 0) ||
                              (burpData.lowPriority && burpData.lowPriority.length > 0);
    
    if (!hasRecommendations) {
        burpRecommendations.innerHTML = '<div class="no-burp-recommendations">No specific attack vectors identified for this target</div>';
        burpSection.style.display = 'block';
        return;
    }
    
    // Display priority sections
    displayPrioritySection(burpData.highPriority, 'High Priority Attack Vectors', 'priority-high', burpRecommendations);
    displayPrioritySection(burpData.mediumPriority, 'Medium Priority Attack Vectors', 'priority-medium', burpRecommendations);
    displayPrioritySection(burpData.lowPriority, 'Low Priority Attack Vectors', 'priority-low', burpRecommendations);
    
    // Display tools section
    displayToolsSection(burpData, burpRecommendations);
    
    burpSection.style.display = 'block';
}

function displayPrioritySection(recommendations, title, className, container) {
    if (!recommendations || recommendations.length === 0) return;
    
    const section = document.createElement('div');
    section.className = `priority-section ${className}`;
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'burp-item';
        
        item.innerHTML = `
            <div class="burp-header">
                <div class="burp-category">${escapeHtml(rec.category)}</div>
                <div class="burp-risk">${escapeHtml(rec.risk)}</div>
            </div>
            <div class="burp-description">${escapeHtml(rec.description)}</div>
            <div class="burp-technique">
                <div class="burp-technique-label">🎯 Burp Technique:</div>
                <div class="burp-technique-text">${escapeHtml(rec.burpTechnique)}</div>
            </div>
            ${rec.extensions ? `
                <div class="burp-extensions">
                    <div class="burp-extensions-label">🔧 Recommended Extensions:</div>
                    <div class="burp-extensions-list">
                        ${rec.extensions.map(ext => `<span class="burp-extension-tag">${escapeHtml(ext)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${rec.scannerConfig ? `
                <div class="burp-config">
                    <div class="burp-config-label">⚙️ Scanner Configuration:</div>
                    <div class="burp-config-text">${escapeHtml(rec.scannerConfig)}</div>
                </div>
            ` : ''}
            ${rec.manualTesting ? `
                <div class="burp-manual">
                    <div class="burp-manual-label">👤 Manual Testing:</div>
                    <div class="burp-manual-text">${escapeHtml(rec.manualTesting)}</div>
                </div>
            ` : ''}
        `;
        
        section.appendChild(item);
    });
    
    container.appendChild(section);
}

function displayToolsSection(burpData, container) {
    const toolsSection = document.createElement('div');
    toolsSection.className = 'tools-section';
    
    const toolsTitle = document.createElement('h3');
    toolsTitle.textContent = '🛠️ Burp Suite Setup Recommendations';
    toolsSection.appendChild(toolsTitle);
    
    const toolsGrid = document.createElement('div');
    toolsGrid.className = 'tools-grid';
    
    // Extensions
    if (burpData.burpExtensions && burpData.burpExtensions.length > 0) {
        const extDiv = document.createElement('div');
        extDiv.className = 'tool-category';
        extDiv.innerHTML = `
            <h4>🔧 Essential Extensions</h4>
            <ul class="tool-list">
                ${burpData.burpExtensions.map(ext => `<li>${escapeHtml(ext)}</li>`).join('')}
            </ul>
        `;
        toolsGrid.appendChild(extDiv);
    }
    
    // Scanner Configuration
    if (burpData.scannerConfig && burpData.scannerConfig.length > 0) {
        const configDiv = document.createElement('div');
        configDiv.className = 'tool-category';
        configDiv.innerHTML = `
            <h4>⚙️ Scanner Configuration</h4>
            <ul class="tool-list">
                ${burpData.scannerConfig.map(config => `<li>${escapeHtml(config)}</li>`).join('')}
            </ul>
        `;
        toolsGrid.appendChild(configDiv);
    }
    
    // Manual Testing
    if (burpData.manualTesting && burpData.manualTesting.length > 0) {
        const manualDiv = document.createElement('div');
        manualDiv.className = 'tool-category';
        manualDiv.innerHTML = `
            <h4>👤 Manual Testing Steps</h4>
            <ul class="tool-list">
                ${burpData.manualTesting.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
            </ul>
        `;
        toolsGrid.appendChild(manualDiv);
    }
    
    toolsSection.appendChild(toolsGrid);
    container.appendChild(toolsSection);
}

function setupEventListeners() {
    // Copy all button
    copyAllBtn.addEventListener('click', copyAllResults);
    
    // Section copy buttons
    document.querySelectorAll('.copy-section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            copySectionData(section);
        });
    });
    
    // Export buttons
    const exportJSONBtn = document.getElementById('exportJSONBtn');
    const exportCSVBtn = document.getElementById('exportCSVBtn');
    const exportXMLBtn = document.getElementById('exportXMLBtn');
    
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportAsJSON);
    }
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportAsCSV);
    }
    if (exportXMLBtn) {
        exportXMLBtn.addEventListener('click', exportAsXML);
    }
    
    // Retry analysis button
    const retryBtn = document.querySelector('.retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', retryAnalysis);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
    
    // Keyboard support
    document.querySelectorAll('.copy-section-btn, #copyAllBtn, .retry-btn, .export-btn, .theme-toggle-btn').forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

async function copyAllResults() {
    if (!currentData) return;
    
    try {
        const text = generateFullReport(currentData);
        await navigator.clipboard.writeText(text);
        showCopyNotification();
    } catch (error) {
        console.error('Failed to copy:', error);
        // Fallback for older browsers
        copyToClipboardFallback(generateFullReport(currentData));
    }
}

async function copySectionData(section) {
    if (!currentData) return;
    
    try {
        let text = '';
        
        switch (section) {
            case 'headers':
                text = generateHeadersReport(currentData.data.headers);
                break;
            case 'server':
                text = generateServerReport(currentData.data.serverInfo);
                break;
            case 'response':
                text = generateResponseReport(currentData.data.responseInfo);
                break;
            case 'cookies':
                text = generateCookieReport(currentData.data.cookieAnalysis);
                break;
            case 'disclosure':
                text = generateDisclosureReport(currentData.data.infoDisclosure);
                break;
            case 'caching':
                text = generateCachingReport(currentData.data.cachingHeaders);
                break;
            case 'burp':
                text = generateBurpReport(currentData.data.burpRecommendations);
                break;
            default:
                text = 'No data available for this section';
        }
        
        await navigator.clipboard.writeText(text);
        showCopyNotification();
    } catch (error) {
        console.error('Failed to copy section:', error);
        copyToClipboardFallback(text);
    }
}

function generateFullReport(data) {
    const date = new Date(data.data.analyzedAt || data.timestamp);
    
    let report = `HEADER INSPECTOR ANALYSIS REPORT\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `URL: ${data.originalUrl}\n`;
    report += `Analysis Date: ${date.toLocaleString()}\n`;
    report += `Security Score: ${data.data.securityHeaders.score || 0}/100\n\n`;
    
    // Security Headers
    report += `SECURITY HEADERS\n`;
    report += `${'-'.repeat(20)}\n`;
    Object.entries(data.data.securityHeaders.headers || {}).forEach(([name, value]) => {
        report += `${formatHeaderName(name)}: ${value ? 'PRESENT' : 'MISSING'}\n`;
        if (value) {
            report += `  Value: ${value}\n`;
        }
    });
    report += '\n';
    
    // Recommendations
    if (data.data.securityHeaders.recommendations && data.data.securityHeaders.recommendations.length > 0) {
        report += `SECURITY RECOMMENDATIONS\n`;
        report += `${'-'.repeat(25)}\n`;
        data.data.securityHeaders.recommendations.forEach((rec, index) => {
            report += `${index + 1}. ${rec}\n`;
        });
        report += '\n';
    }
    
    // All Headers
    report += `ALL HTTP HEADERS\n`;
    report += `${'-'.repeat(18)}\n`;
    Object.entries(data.data.headers || {}).forEach(([name, value]) => {
        report += `${name}: ${value}\n`;
    });
    report += '\n';
    
    // Server Info
    report += `SERVER INFORMATION\n`;
    report += `${'-'.repeat(18)}\n`;
    Object.entries(data.data.serverInfo || {}).forEach(([key, value]) => {
        if (value) {
            report += `${formatInfoLabel(key)}: ${value}\n`;
        }
    });
    report += '\n';
    
    // Cookie Analysis
    if (data.data.cookieAnalysis) {
        report += `COOKIE ANALYSIS\n`;
        report += `${'-'.repeat(15)}\n`;
        report += `Cookie Count: ${data.data.cookieAnalysis.cookieCount}\n`;
        if (data.data.cookieAnalysis.securityIssues && data.data.cookieAnalysis.securityIssues.length > 0) {
            report += `Security Issues:\n`;
            data.data.cookieAnalysis.securityIssues.forEach(issue => {
                report += `  - ${issue}\n`;
            });
        }
        report += '\n';
    }
    
    // Information Disclosure
    if (data.data.infoDisclosure && data.data.infoDisclosure.length > 0) {
        report += `INFORMATION DISCLOSURE\n`;
        report += `${'-'.repeat(22)}\n`;
        data.data.infoDisclosure.forEach(disclosure => {
            report += `${disclosure.header}: ${disclosure.value} (${disclosure.risk})\n`;
        });
        report += '\n';
    }
    
    // Caching Issues
    if (data.data.cachingHeaders && data.data.cachingHeaders.issues && data.data.cachingHeaders.issues.length > 0) {
        report += `CACHING ISSUES\n`;
        report += `${'-'.repeat(14)}\n`;
        data.data.cachingHeaders.issues.forEach(issue => {
            report += `- ${issue}\n`;
        });
        report += '\n';
    }
    
    return report;
}

function generateHeadersReport(headers) {
    let report = `HTTP HEADERS\n`;
    report += `${'-'.repeat(12)}\n`;
    Object.entries(headers || {}).forEach(([name, value]) => {
        report += `${name}: ${value}\n`;
    });
    return report;
}

function generateServerReport(serverInfo) {
    let report = `SERVER INFORMATION\n`;
    report += `${'-'.repeat(18)}\n`;
    Object.entries(serverInfo || {}).forEach(([key, value]) => {
        if (value) {
            report += `${formatInfoLabel(key)}: ${value}\n`;
        }
    });
    return report;
}

function generateResponseReport(responseInfo) {
    let report = `RESPONSE INFORMATION\n`;
    report += `${'-'.repeat(20)}\n`;
    Object.entries(responseInfo || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            report += `${formatInfoLabel(key)}: ${value}\n`;
        }
    });
    return report;
}

function generateCookieReport(cookieData) {
    let report = `COOKIE ANALYSIS\n`;
    report += `${'-'.repeat(15)}\n`;
    
    if (!cookieData) {
        report += `No cookie data available\n`;
        return report;
    }
    
    report += `Cookie Count: ${cookieData.cookieCount}\n\n`;
    
    if (cookieData.securityIssues && cookieData.securityIssues.length > 0) {
        report += `SECURITY ISSUES:\n`;
        cookieData.securityIssues.forEach(issue => {
            report += `- ${issue}\n`;
        });
        report += '\n';
    }
    
    if (cookieData.cookies && cookieData.cookies.length > 0) {
        report += `COOKIE DETAILS:\n`;
        cookieData.cookies.forEach((cookie, index) => {
            report += `Cookie ${index + 1}: ${cookie}\n`;
        });
    }
    
    return report;
}

function generateDisclosureReport(disclosures) {
    let report = `INFORMATION DISCLOSURE\n`;
    report += `${'-'.repeat(22)}\n`;
    
    if (!disclosures || disclosures.length === 0) {
        report += `No information disclosure detected\n`;
        return report;
    }
    
    disclosures.forEach(disclosure => {
        report += `Header: ${disclosure.header}\n`;
        report += `Risk: ${disclosure.risk}\n`;
        report += `Value: ${disclosure.value}\n`;
        report += `Description: ${disclosure.description}\n\n`;
    });
    
    return report;
}

function generateCachingReport(cachingData) {
    let report = `CACHING CONFIGURATION\n`;
    report += `${'-'.repeat(21)}\n`;
    
    if (!cachingData) {
        report += `No caching data available\n`;
        return report;
    }
    
    const headers = ['cacheControl', 'expires', 'etag', 'lastModified', 'pragma', 'vary'];
    const labels = ['Cache-Control', 'Expires', 'ETag', 'Last-Modified', 'Pragma', 'Vary'];
    
    headers.forEach((header, index) => {
        if (cachingData[header]) {
            report += `${labels[index]}: ${cachingData[header]}\n`;
        }
    });
    
    if (cachingData.issues && cachingData.issues.length > 0) {
        report += `\nCACHING ISSUES:\n`;
        cachingData.issues.forEach(issue => {
            report += `- ${issue}\n`;
        });
    }
    
    return report;
}

function generateBurpReport(burpData) {
    let report = `BURP SUITE ATTACK VECTORS\n`;
    report += `${'='.repeat(30)}\n\n`;
    
    if (!burpData) {
        report += `No Burp recommendations available\n`;
        return report;
    }
    
    // High Priority
    if (burpData.highPriority && burpData.highPriority.length > 0) {
        report += `HIGH PRIORITY ATTACK VECTORS\n`;
        report += `${'-'.repeat(30)}\n`;
        burpData.highPriority.forEach((rec, index) => {
            report += `${index + 1}. ${rec.category} - ${rec.risk}\n`;
            report += `   Description: ${rec.description}\n`;
            report += `   Technique: ${rec.burpTechnique}\n`;
            if (rec.extensions) {
                report += `   Extensions: ${rec.extensions.join(', ')}\n`;
            }
            report += '\n';
        });
    }
    
    // Medium Priority
    if (burpData.mediumPriority && burpData.mediumPriority.length > 0) {
        report += `MEDIUM PRIORITY ATTACK VECTORS\n`;
        report += `${'-'.repeat(32)}\n`;
        burpData.mediumPriority.forEach((rec, index) => {
            report += `${index + 1}. ${rec.category} - ${rec.risk}\n`;
            report += `   Description: ${rec.description}\n`;
            report += `   Technique: ${rec.burpTechnique}\n`;
            if (rec.extensions) {
                report += `   Extensions: ${rec.extensions.join(', ')}\n`;
            }
            report += '\n';
        });
    }
    
    // Low Priority
    if (burpData.lowPriority && burpData.lowPriority.length > 0) {
        report += `LOW PRIORITY ATTACK VECTORS\n`;
        report += `${'-'.repeat(29)}\n`;
        burpData.lowPriority.forEach((rec, index) => {
            report += `${index + 1}. ${rec.category} - ${rec.risk}\n`;
            report += `   Description: ${rec.description}\n`;
            report += `   Technique: ${rec.burpTechnique}\n`;
            if (rec.extensions) {
                report += `   Extensions: ${rec.extensions.join(', ')}\n`;
            }
            report += '\n';
        });
    }
    
    // Tools and Configuration
    if (burpData.burpExtensions && burpData.burpExtensions.length > 0) {
        report += `RECOMMENDED EXTENSIONS\n`;
        report += `${'-'.repeat(22)}\n`;
        burpData.burpExtensions.forEach(ext => {
            report += `- ${ext}\n`;
        });
        report += '\n';
    }
    
    if (burpData.scannerConfig && burpData.scannerConfig.length > 0) {
        report += `SCANNER CONFIGURATION\n`;
        report += `${'-'.repeat(21)}\n`;
        burpData.scannerConfig.forEach(config => {
            report += `- ${config}\n`;
        });
        report += '\n';
    }
    
    if (burpData.manualTesting && burpData.manualTesting.length > 0) {
        report += `MANUAL TESTING STEPS\n`;
        report += `${'-'.repeat(20)}\n`;
        burpData.manualTesting.forEach(step => {
            report += `- ${step}\n`;
        });
        report += '\n';
    }
    
    return report;
}

function copyToClipboardFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification();
    } catch (err) {
        console.error('Fallback copy failed:', err);
        // Show manual copy dialog
        prompt('Copy this text manually:', text);
    }
    
    document.body.removeChild(textArea);
}

function showCopyNotification() {
    copyNotification.classList.add('show');
    setTimeout(() => {
        copyNotification.classList.remove('show');
    }, 2000);
}

async function retryAnalysis() {
    // Get stored URL for retry
    const storedUrl = sessionStorage.getItem('analysisUrl');
    const analysisType = sessionStorage.getItem('analysisType');
    
    if (!storedUrl) {
        showError('No URL available for retry. Please go back to the extension and run a new analysis.');
        return;
    }
    
    try {
        // Show loading state
        loadingContainer.style.display = 'flex';
        resultsContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        
        // Get current active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tabs || tabs.length === 0) {
            throw new Error('No active tab found');
        }
        
        const currentTab = tabs[0];
        
        // Send message to background script to perform new analysis
        const response = await chrome.runtime.sendMessage({
            action: 'analyze',
            feature: 'headers',
            url: storedUrl,
            tabId: currentTab.id
        });
        
        if (response && response.success) {
            // Analysis completed, reload the page to show new results
            window.location.reload();
        } else {
            throw new Error(response?.error || 'Analysis failed');
        }
        
    } catch (error) {
        console.error('Retry analysis failed:', error);
        showError(`Retry failed: ${error.message}`);
        
        // Show results container again on error
        loadingContainer.style.display = 'none';
        if (currentData) {
            resultsContainer.style.display = 'block';
        }
    }
}

function showError(message) {
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = message;
}

// Advanced Export Functions
async function exportAsJSON() {
    if (!currentData) return;
    
    try {
        const exportData = {
            metadata: {
                tool: 'PenTest Assistant - Header Inspector',
                version: '1.5.0',
                analysisType: 'headers',
                url: currentData.originalUrl,
                timestamp: new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString(),
                exportedAt: new Date().toISOString()
            },
            analysis: {
                securityScore: currentData.data.securityHeaders?.securityScore || 0,
                headers: currentData.data.headers || {},
                securityHeaders: currentData.data.securityHeaders || {},
                serverInfo: currentData.data.serverInfo || {},
                responseInfo: currentData.data.responseInfo || {},
                cookieAnalysis: currentData.data.cookieAnalysis || {},
                infoDisclosure: currentData.data.infoDisclosure || [],
                cachingHeaders: currentData.data.cachingHeaders || {},
                burpRecommendations: currentData.data.burpRecommendations || {}
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, `headers-analysis-${formatDateForFilename()}.json`, 'application/json');
        showCopyNotification('JSON export downloaded successfully!');
    } catch (error) {
        console.error('JSON export failed:', error);
        showCopyNotification('JSON export failed');
    }
}

async function exportAsCSV() {
    if (!currentData) return;
    
    try {
        let csvContent = 'Category,Item,Value,Risk Level,Description\n';
        
        // Headers
        Object.entries(currentData.data.headers || {}).forEach(([name, value]) => {
            csvContent += `"Headers","${escapeCSV(name)}","${escapeCSV(value)}","Info","HTTP Response Header"\n`;
        });
        
        // Security Headers
        if (currentData.data.securityHeaders?.headers) {
            Object.entries(currentData.data.securityHeaders.headers).forEach(([name, info]) => {
                if (info && typeof info === 'object') {
                    const risk = info.missing ? 'High' : 'Low';
                    const value = info.missing ? 'Missing' : (info.value || 'Not Set');
                    csvContent += `"Security Headers","${escapeCSV(name)}","${escapeCSV(value)}","${risk}","${escapeCSV(info.description || '')}"\n`;
                }
            });
        }
        
        // Server Information
        Object.entries(currentData.data.serverInfo || {}).forEach(([key, value]) => {
            if (value) {
                csvContent += `"Server Info","${escapeCSV(key)}","${escapeCSV(value)}","Info","Server Configuration"\n`;
            }
        });
        
        // Cookie Analysis
        if (currentData.data.cookieAnalysis?.securityIssues) {
            currentData.data.cookieAnalysis.securityIssues.forEach(issue => {
                csvContent += `"Cookie Security","Security Issue","${escapeCSV(issue)}","Medium","Cookie Security Concern"\n`;
            });
        }
        
        // Information Disclosure
        if (currentData.data.infoDisclosure) {
            currentData.data.infoDisclosure.forEach(disclosure => {
                csvContent += `"Information Disclosure","${escapeCSV(disclosure.header)}","${escapeCSV(disclosure.value)}","${disclosure.risk}","${escapeCSV(disclosure.description || '')}"\n`;
            });
        }
        
        // Burp Recommendations
        if (currentData.data.burpRecommendations) {
            ['highPriority', 'mediumPriority', 'lowPriority'].forEach(priority => {
                const items = currentData.data.burpRecommendations[priority] || [];
                items.forEach(item => {
                    csvContent += `"Burp Recommendations","${escapeCSV(item.category)}","${escapeCSV(item.description)}","${priority.replace('Priority', '')}","${escapeCSV(item.burpTechnique || '')}"\n`;
                });
            });
        }
        
        downloadFile(csvContent, `headers-analysis-${formatDateForFilename()}.csv`, 'text/csv');
        showCopyNotification('CSV export downloaded successfully!');
    } catch (error) {
        console.error('CSV export failed:', error);
        showCopyNotification('CSV export failed');
    }
}

async function exportAsXML() {
    if (!currentData) return;
    
    try {
        let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xmlContent += `<pentest-analysis tool="PenTest Assistant" version="1.5.0" type="headers">\n`;
        xmlContent += `  <metadata>\n`;
        xmlContent += `    <url>${escapeXML(currentData.originalUrl)}</url>\n`;
        xmlContent += `    <timestamp>${new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString()}</timestamp>\n`;
        xmlContent += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
        xmlContent += `  </metadata>\n`;
        
        xmlContent += `  <analysis>\n`;
        xmlContent += `    <securityScore>${currentData.data.securityHeaders?.securityScore || 0}</securityScore>\n`;
        
        // Headers
        xmlContent += `    <headers>\n`;
        Object.entries(currentData.data.headers || {}).forEach(([name, value]) => {
            xmlContent += `      <header name="${escapeXML(name)}">${escapeXML(value)}</header>\n`;
        });
        xmlContent += `    </headers>\n`;
        
        // Security Headers
        if (currentData.data.securityHeaders?.headers) {
            xmlContent += `    <securityHeaders>\n`;
            Object.entries(currentData.data.securityHeaders.headers).forEach(([name, info]) => {
                if (info && typeof info === 'object') {
                    xmlContent += `      <securityHeader name="${escapeXML(name)}" missing="${info.missing || false}">\n`;
                    xmlContent += `        <value>${escapeXML(info.value || 'Missing')}</value>\n`;
                    xmlContent += `        <description>${escapeXML(info.description || '')}</description>\n`;
                    xmlContent += `      </securityHeader>\n`;
                }
            });
            xmlContent += `    </securityHeaders>\n`;
        }
        
        // Server Information
        xmlContent += `    <serverInfo>\n`;
        Object.entries(currentData.data.serverInfo || {}).forEach(([key, value]) => {
            if (value) {
                xmlContent += `      <${key}>${escapeXML(value)}</${key}>\n`;
            }
        });
        xmlContent += `    </serverInfo>\n`;
        
        xmlContent += `  </analysis>\n`;
        xmlContent += `</pentest-analysis>`;
        
        downloadFile(xmlContent, `headers-analysis-${formatDateForFilename()}.xml`, 'application/xml');
        showCopyNotification('XML export downloaded successfully!');
    } catch (error) {
        console.error('XML export failed:', error);
        showCopyNotification('XML export failed');
    }
}

// Export utility functions
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatDateForFilename() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function escapeCSV(str) {
    if (typeof str !== 'string') str = String(str);
    return str.replace(/"/g, '""');
}

function escapeXML(str) {
    if (typeof str !== 'string') str = String(str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showCopyNotification(message = 'Copied to clipboard!') {
    if (copyNotification) {
        copyNotification.textContent = message;
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }
}

// Utility functions
function formatHeaderName(name) {
    return name.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatInfoLabel(key) {
    return key.split(/(?=[A-Z])/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up storage if needed
    if (tabId) {
        chrome.storage.local.remove(`results_${tabId}`);
    }
}); 