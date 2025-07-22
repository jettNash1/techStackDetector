// Certificate Results JavaScript

// DOM elements
const analyzedUrlElement = document.getElementById('analyzedUrl');
const analysisTimeElement = document.getElementById('analysisTime');
const loadingContainer = document.getElementById('loadingContainer');
const resultsContainer = document.getElementById('resultsContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const errorDetails = document.getElementById('errorDetails');
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
        const result = await chrome.storage.local.get(['theme']);
        const savedTheme = result.theme;
        let theme = savedTheme;
        if (!theme) {
            // Default to dark mode
            theme = 'dark';
        }
        applyTheme(theme);
        updateThemeToggleIcon(theme);
    } catch (error) {
        console.error('Failed to initialize theme:', error);
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
                console.log('Found data for tab ID:', tabId);
                return result[`results_${tabId}`];
            }
        }
        
        console.log('No direct tab data found, searching for most recent certificate analysis...');
        
        // Fallback: get all results and find the most recent certificate analysis
        const allData = await chrome.storage.local.get(null);
        const resultsKeys = Object.keys(allData).filter(key => key.startsWith('results_'));
        
        console.log('Available storage keys:', resultsKeys);
        
        let mostRecent = null;
        let mostRecentTime = 0;
        
        for (const key of resultsKeys) {
            const data = allData[key];
            console.log(`Checking ${key}:`, data);
            if (data && data.feature === 'certificate' && data.timestamp > mostRecentTime) {
                mostRecent = data;
                mostRecentTime = data.timestamp;
                console.log('Found more recent certificate data:', key);
            }
        }
        
        if (mostRecent) {
            console.log('Using most recent certificate data:', mostRecent);
        } else {
            console.log('No certificate analysis data found in storage');
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
        sessionStorage.setItem('analysisType', 'certificate');
        
        // Update header information
        analyzedUrlElement.textContent = data.originalUrl;
        
        const analysisDate = new Date(data.data.analyzedAt || data.timestamp);
        analysisTimeElement.textContent = `Analysis Time: ${analysisDate.toLocaleString()}`;
        
        exportTime.textContent = `Exported: ${new Date().toLocaleString()}`;
        
        // Check if there's an error in the data
        if (data.data.error) {
            showDataError(data.data.error);
            return;
        }
        
        // Display certificate status
        displayCertificateStatus(data.data);
        
        // Display certificate information
        displayCertificateInfo(data.data);
        
        // Display HSTS configuration
        displayHSTSInfo(data.data.hsts);
        
        // Display security headers
        displaySecurityHeaders(data.data.headers);
        
        // Display certificate chain if available
        if (data.data.chain) {
            displayCertificateChain(data.data.chain);
        }
        
        // Display recommendations
        displayRecommendations(data.data);
        
        // Display analysis notes if available
        if (data.data.note) {
            displayAnalysisNotes(data.data.note);
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

function displayCertificateStatus(data) {
    const certStatus = document.getElementById('certStatus');
    
    let statusClass = 'status-warning';
    let statusText = 'Unknown Status';
    
    if (data.error) {
        statusClass = 'status-insecure';
        statusText = 'Certificate Error';
    } else if (data.protocol === 'HTTPS') {
        statusClass = 'status-secure';
        statusText = 'HTTPS Enabled';
    } else {
        statusClass = 'status-insecure';
        statusText = 'No HTTPS';
    }
    
    certStatus.innerHTML = `
        <div class="cert-status-badge ${statusClass}">
            ${statusText}
        </div>
    `;
}

function displayCertificateInfo(data) {
    const certInfo = document.getElementById('certInfo');
    certInfo.innerHTML = '';
    
    const infoItems = [
        { label: 'Protocol', value: data.protocol || 'Unknown' },
        { label: 'Domain', value: data.domain || 'Unknown' },
        { label: 'Port', value: data.port || 'Unknown' }
    ];
    
    // Add additional certificate fields if available
    if (data.issuer) infoItems.push({ label: 'Issuer', value: data.issuer });
    if (data.subject) infoItems.push({ label: 'Subject', value: data.subject });
    if (data.validFrom) infoItems.push({ label: 'Valid From', value: formatDate(data.validFrom) });
    if (data.validTo) infoItems.push({ label: 'Valid To', value: formatDate(data.validTo) });
    if (data.serialNumber) infoItems.push({ label: 'Serial Number', value: data.serialNumber });
    if (data.fingerprint) infoItems.push({ label: 'Fingerprint', value: data.fingerprint });
    
    infoItems.forEach(item => {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-item';
        infoDiv.innerHTML = `
            <div class="info-label">${item.label}</div>
            <div class="info-value">${escapeHtml(String(item.value))}</div>
        `;
        certInfo.appendChild(infoDiv);
    });
}

function displayHSTSInfo(hstsData) {
    const hstsInfo = document.getElementById('hstsInfo');
    
    if (!hstsData) {
        hstsInfo.innerHTML = `
            <div class="hsts-status">
                <span>❌</span>
                <span>HSTS not configured</span>
            </div>
            <div class="hsts-details">
                <p>HTTP Strict Transport Security (HSTS) is not enabled for this domain.</p>
            </div>
        `;
        hstsInfo.className = 'hsts-info hsts-disabled';
        return;
    }
    
    if (hstsData.enabled) {
        hstsInfo.className = 'hsts-info hsts-enabled';
        
        let detailsHtml = '';
        if (hstsData.maxAge) {
            detailsHtml += `
                <div class="info-item">
                    <div class="info-label">Max Age</div>
                    <div class="info-value">${hstsData.maxAge.seconds} seconds (${hstsData.maxAge.days} days)</div>
                </div>
            `;
        }
        
        detailsHtml += `
            <div class="info-item">
                <div class="info-label">Include Subdomains</div>
                <div class="info-value">${hstsData.includeSubDomains ? 'Yes' : 'No'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Preload</div>
                <div class="info-value">${hstsData.preload ? 'Yes' : 'No'}</div>
            </div>
        `;
        
        if (hstsData.header) {
            detailsHtml += `
                <div class="info-item">
                    <div class="info-label">Header Value</div>
                    <div class="info-value">${escapeHtml(hstsData.header)}</div>
                </div>
            `;
        }
        
        hstsInfo.innerHTML = `
            <div class="hsts-status">
                <span>✅</span>
                <span>HSTS enabled</span>
            </div>
            <div class="hsts-details">
                ${detailsHtml}
            </div>
        `;
    } else {
        hstsInfo.className = 'hsts-info hsts-disabled';
        hstsInfo.innerHTML = `
            <div class="hsts-status">
                <span>❌</span>
                <span>HSTS not configured</span>
            </div>
            <div class="hsts-details">
                <p>HTTP Strict Transport Security (HSTS) is not enabled for this domain.</p>
            </div>
        `;
    }
}

function displaySecurityHeaders(headers) {
    const securityHeaders = document.getElementById('securityHeaders');
    securityHeaders.innerHTML = '';
    
    if (!headers || Object.keys(headers).length === 0) {
        securityHeaders.innerHTML = '<div class="no-headers">No certificate-related security headers found</div>';
        return;
    }
    
    Object.entries(headers).forEach(([name, value]) => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-item';
        headerDiv.innerHTML = `
            <div class="header-name">${formatHeaderName(name)}</div>
            <div class="header-value">${escapeHtml(value)}</div>
        `;
        securityHeaders.appendChild(headerDiv);
    });
}

function displayCertificateChain(chain) {
    const chainSection = document.getElementById('chainSection');
    const certChain = document.getElementById('certChain');
    
    if (!chain || chain.length === 0) {
        return; // Keep section hidden
    }
    
    certChain.innerHTML = '';
    
    chain.forEach((cert, index) => {
        const certDiv = document.createElement('div');
        certDiv.className = 'cert-chain-item';
        certDiv.innerHTML = `
            <h4>Certificate ${index + 1}</h4>
            <div class="cert-details">
                <div class="info-item">
                    <div class="info-label">Subject</div>
                    <div class="info-value">${escapeHtml(cert.subject || 'Unknown')}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Issuer</div>
                    <div class="info-value">${escapeHtml(cert.issuer || 'Unknown')}</div>
                </div>
                ${cert.validFrom ? `
                    <div class="info-item">
                        <div class="info-label">Valid From</div>
                        <div class="info-value">${formatDate(cert.validFrom)}</div>
                    </div>
                ` : ''}
                ${cert.validTo ? `
                    <div class="info-item">
                        <div class="info-label">Valid To</div>
                        <div class="info-value">${formatDate(cert.validTo)}</div>
                    </div>
                ` : ''}
            </div>
        `;
        certChain.appendChild(certDiv);
    });
    
    chainSection.style.display = 'block';
}

function displayRecommendations(data) {
    const recommendations = document.getElementById('recommendations');
    const recs = [];
    
    // Generate recommendations based on the analysis
    if (data.protocol !== 'HTTPS') {
        recs.push('Enable HTTPS to encrypt data in transit');
    }
    
    if (!data.hsts || !data.hsts.enabled) {
        recs.push('Implement HTTP Strict Transport Security (HSTS) to enforce HTTPS connections');
    } else {
        if (data.hsts.maxAge && data.hsts.maxAge.days < 365) {
            recs.push('Consider increasing HSTS max-age to at least 1 year (31536000 seconds)');
        }
        if (!data.hsts.includeSubDomains) {
            recs.push('Consider enabling HSTS for subdomains by adding includeSubDomains directive');
        }
    }
    
    if (!data.headers || !data.headers['public-key-pins']) {
        recs.push('Consider implementing Certificate Pinning for enhanced security');
    }
    
    if (!data.headers || !data.headers['expect-ct']) {
        recs.push('Consider implementing Certificate Transparency monitoring with Expect-CT header');
    }
    
    recommendations.innerHTML = '';
    
    if (recs.length === 0) {
        recommendations.innerHTML = `
            <div class="recommendation-item">
                <span class="recommendation-icon">✅</span>
                <span class="recommendation-text">Certificate configuration looks good! No specific recommendations.</span>
            </div>
        `;
    } else {
        recs.forEach(rec => {
            const recDiv = document.createElement('div');
            recDiv.className = 'recommendation-item';
            recDiv.innerHTML = `
                <span class="recommendation-icon">💡</span>
                <span class="recommendation-text">${escapeHtml(rec)}</span>
            `;
            recommendations.appendChild(recDiv);
        });
    }
}

function displayAnalysisNotes(note) {
    const notesSection = document.getElementById('notesSection');
    const analysisNotes = document.getElementById('analysisNotes');
    
    if (note) {
        analysisNotes.textContent = note;
        notesSection.style.display = 'block';
    }
}

function showDataError(error) {
    const errorMsg = typeof error === 'string' ? error : error.message || 'Unknown error';
    errorDetails.textContent = errorMsg;
    
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = 'Certificate analysis error occurred';
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
        copyToClipboardFallback(generateFullReport(currentData));
    }
}

async function copySectionData(section) {
    if (!currentData) return;
    
    try {
        let text = '';
        const data = currentData.data;
        
        switch (section) {
            case 'certificate':
                text = generateCertificateReport(data);
                break;
            case 'hsts':
                text = generateHSTSReport(data.hsts);
                break;
            case 'security-headers':
                text = generateSecurityHeadersReport(data.headers);
                break;
            case 'chain':
                text = generateChainReport(data.chain);
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
    
    let report = `CERTIFICATE ANALYZER REPORT\n`;
    report += `${'='.repeat(40)}\n\n`;
    report += `URL: ${data.originalUrl}\n`;
    report += `Analysis Date: ${date.toLocaleString()}\n\n`;
    
    if (data.data.error) {
        report += `ERROR: ${data.data.error}\n\n`;
        return report;
    }
    
    // Certificate Status
    report += `CERTIFICATE STATUS\n`;
    report += `${'-'.repeat(18)}\n`;
    report += `Protocol: ${data.data.protocol || 'Unknown'}\n`;
    report += `Domain: ${data.data.domain || 'Unknown'}\n`;
    report += `Port: ${data.data.port || 'Unknown'}\n\n`;
    
    // HSTS Configuration
    report += `HSTS CONFIGURATION\n`;
    report += `${'-'.repeat(18)}\n`;
    if (data.data.hsts && data.data.hsts.enabled) {
        report += `Status: Enabled\n`;
        if (data.data.hsts.maxAge) {
            report += `Max Age: ${data.data.hsts.maxAge.seconds} seconds (${data.data.hsts.maxAge.days} days)\n`;
        }
        report += `Include Subdomains: ${data.data.hsts.includeSubDomains ? 'Yes' : 'No'}\n`;
        report += `Preload: ${data.data.hsts.preload ? 'Yes' : 'No'}\n`;
    } else {
        report += `Status: Not configured\n`;
    }
    report += '\n';
    
    // Security Headers
    if (data.data.headers && Object.keys(data.data.headers).length > 0) {
        report += `SECURITY HEADERS\n`;
        report += `${'-'.repeat(16)}\n`;
        Object.entries(data.data.headers).forEach(([name, value]) => {
            report += `${name}: ${value}\n`;
        });
        report += '\n';
    }
    
    // Notes
    if (data.data.note) {
        report += `ANALYSIS NOTES\n`;
        report += `${'-'.repeat(14)}\n`;
        report += `${data.data.note}\n\n`;
    }
    
    return report;
}

function generateCertificateReport(data) {
    let report = `CERTIFICATE INFORMATION\n`;
    report += `${'-'.repeat(23)}\n`;
    report += `Protocol: ${data.protocol || 'Unknown'}\n`;
    report += `Domain: ${data.domain || 'Unknown'}\n`;
    report += `Port: ${data.port || 'Unknown'}\n`;
    
    if (data.issuer) report += `Issuer: ${data.issuer}\n`;
    if (data.subject) report += `Subject: ${data.subject}\n`;
    if (data.validFrom) report += `Valid From: ${formatDate(data.validFrom)}\n`;
    if (data.validTo) report += `Valid To: ${formatDate(data.validTo)}\n`;
    
    return report;
}

function generateHSTSReport(hstsData) {
    let report = `HSTS CONFIGURATION\n`;
    report += `${'-'.repeat(18)}\n`;
    
    if (!hstsData || !hstsData.enabled) {
        report += `Status: Not configured\n`;
        return report;
    }
    
    report += `Status: Enabled\n`;
    if (hstsData.maxAge) {
        report += `Max Age: ${hstsData.maxAge.seconds} seconds (${hstsData.maxAge.days} days)\n`;
    }
    report += `Include Subdomains: ${hstsData.includeSubDomains ? 'Yes' : 'No'}\n`;
    report += `Preload: ${hstsData.preload ? 'Yes' : 'No'}\n`;
    
    return report;
}

function generateSecurityHeadersReport(headers) {
    let report = `SECURITY HEADERS\n`;
    report += `${'-'.repeat(16)}\n`;
    
    if (!headers || Object.keys(headers).length === 0) {
        report += `No certificate-related security headers found\n`;
        return report;
    }
    
    Object.entries(headers).forEach(([name, value]) => {
        report += `${name}: ${value}\n`;
    });
    
    return report;
}

function generateChainReport(chain) {
    let report = `CERTIFICATE CHAIN\n`;
    report += `${'-'.repeat(17)}\n`;
    
    if (!chain || chain.length === 0) {
        report += `No certificate chain information available\n`;
        return report;
    }
    
    chain.forEach((cert, index) => {
        report += `Certificate ${index + 1}:\n`;
        report += `  Subject: ${cert.subject || 'Unknown'}\n`;
        report += `  Issuer: ${cert.issuer || 'Unknown'}\n`;
        if (cert.validFrom) report += `  Valid From: ${formatDate(cert.validFrom)}\n`;
        if (cert.validTo) report += `  Valid To: ${formatDate(cert.validTo)}\n`;
        report += '\n';
    });
    
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
            feature: 'certificate',
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
                tool: 'PenTest Assistant - Certificate Analyzer',
                version: '1.5.0',
                analysisType: 'certificate',
                url: currentData.originalUrl,
                timestamp: new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString(),
                exportedAt: new Date().toISOString()
            },
            analysis: {
                certificateInfo: currentData.data.certificateInfo || {},
                certificateStatus: currentData.data.certificateStatus || {},
                hstsInfo: currentData.data.hstsInfo || {},
                burpRecommendations: currentData.data.burpRecommendations || {},
                owaspMapping: currentData.data.owaspMapping || {},
                cvssScoring: currentData.data.cvssScoring || {}
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, `certificate-analysis-${formatDateForFilename()}.json`, 'application/json');
        showCopyNotification('JSON export downloaded successfully!');
    } catch (error) {
        console.error('JSON export failed:', error);
        showCopyNotification('JSON export failed');
    }
}

async function exportAsCSV() {
    if (!currentData) return;
    
    try {
        let csvContent = 'Category,Item,Value,Status,Risk Level,Description\n';
        
        // Certificate Status
        if (currentData.data.certificateStatus) {
            Object.entries(currentData.data.certificateStatus).forEach(([key, value]) => {
                if (key !== 'valid' && value !== undefined && value !== null) {
                    const status = value ? 'Present' : 'Missing';
                    const risk = getRiskLevelForCertificate(key, value);
                    csvContent += `"Certificate Status","${escapeCSV(formatCertificateField(key))}","${escapeCSV(String(value))}","${status}","${risk}","${escapeCSV(getCertificateDescription(key))}"\n`;
                }
            });
        }
        
        // Certificate Information
        if (currentData.data.certificateInfo) {
            Object.entries(currentData.data.certificateInfo).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    csvContent += `"Certificate Info","${escapeCSV(formatCertificateField(key))}","${escapeCSV(String(value))}","Info","Low","${escapeCSV(getCertificateDescription(key))}"\n`;
                }
            });
        }
        
        // HSTS Information
        if (currentData.data.hstsInfo) {
            Object.entries(currentData.data.hstsInfo).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    const risk = key.includes('missing') ? 'Medium' : 'Low';
                    csvContent += `"HSTS Configuration","${escapeCSV(formatCertificateField(key))}","${escapeCSV(String(value))}","Info","${risk}","${escapeCSV(getHSTSDescription(key))}"\n`;
                }
            });
        }
        
        // Burp Recommendations
        if (currentData.data.burpRecommendations) {
            ['highPriority', 'mediumPriority', 'lowPriority'].forEach(priority => {
                const items = currentData.data.burpRecommendations[priority] || [];
                items.forEach(item => {
                    if (item && typeof item === 'object') {
                        csvContent += `"Burp Recommendations","${escapeCSV(item.category || 'Unknown')}","${escapeCSV(item.description || '')}","${priority.replace('Priority', '')}","${escapeCSV(item.risk || '')}","${escapeCSV(item.burpTechnique || '')}"\n`;
                    }
                });
            });
        }
        
        downloadFile(csvContent, `certificate-analysis-${formatDateForFilename()}.csv`, 'text/csv');
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
        xmlContent += `<pentest-analysis tool="PenTest Assistant" version="1.5.0" type="certificate">\n`;
        xmlContent += `  <metadata>\n`;
        xmlContent += `    <url>${escapeXML(currentData.originalUrl)}</url>\n`;
        xmlContent += `    <timestamp>${new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString()}</timestamp>\n`;
        xmlContent += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
        xmlContent += `  </metadata>\n`;
        
        xmlContent += `  <analysis>\n`;
        
        // Certificate Status
        if (currentData.data.certificateStatus) {
            xmlContent += `    <certificateStatus>\n`;
            Object.entries(currentData.data.certificateStatus).forEach(([key, value]) => {
                if (key !== 'valid' && value !== undefined && value !== null) {
                    xmlContent += `      <status name="${escapeXML(key)}" value="${escapeXML(String(value))}">\n`;
                    xmlContent += `        <description>${escapeXML(getCertificateDescription(key))}</description>\n`;
                    xmlContent += `      </status>\n`;
                }
            });
            xmlContent += `    </certificateStatus>\n`;
        }
        
        // Certificate Information
        if (currentData.data.certificateInfo) {
            xmlContent += `    <certificateInfo>\n`;
            Object.entries(currentData.data.certificateInfo).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    xmlContent += `      <info name="${escapeXML(key)}">${escapeXML(String(value))}</info>\n`;
                }
            });
            xmlContent += `    </certificateInfo>\n`;
        }
        
        // HSTS Information
        if (currentData.data.hstsInfo) {
            xmlContent += `    <hstsInfo>\n`;
            Object.entries(currentData.data.hstsInfo).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    xmlContent += `      <hsts name="${escapeXML(key)}">${escapeXML(String(value))}</hsts>\n`;
                }
            });
            xmlContent += `    </hstsInfo>\n`;
        }
        
        xmlContent += `  </analysis>\n`;
        xmlContent += `</pentest-analysis>`;
        
        downloadFile(xmlContent, `certificate-analysis-${formatDateForFilename()}.xml`, 'application/xml');
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

function getRiskLevelForCertificate(key, value) {
    const keyLower = String(key).toLowerCase();
    
    // High risk conditions
    if (keyLower.includes('expired') || keyLower.includes('invalid') || 
        keyLower.includes('self-signed') || (keyLower.includes('valid') && !value)) {
        return 'High';
    }
    // Medium risk conditions
    if (keyLower.includes('weak') || keyLower.includes('old') || 
        keyLower.includes('deprecated') || keyLower.includes('expiring')) {
        return 'Medium';
    }
    // Default to low risk
    return 'Low';
}

function formatCertificateField(field) {
    return field.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
}

function getCertificateDescription(key) {
    const descriptions = {
        'issuer': 'Certificate issuing authority',
        'subject': 'Certificate subject information',
        'validFrom': 'Certificate validity start date',
        'validTo': 'Certificate validity end date',
        'algorithm': 'Certificate signature algorithm',
        'keySize': 'Certificate key size',
        'serialNumber': 'Certificate serial number',
        'fingerprint': 'Certificate fingerprint',
        'expired': 'Certificate expiration status',
        'selfSigned': 'Self-signed certificate indicator',
        'valid': 'Overall certificate validity'
    };
    return descriptions[key] || 'Certificate property';
}

function getHSTSDescription(key) {
    const descriptions = {
        'enabled': 'HSTS header presence',
        'maxAge': 'HSTS maximum age directive',
        'includeSubDomains': 'HSTS subdomain inclusion',
        'preload': 'HSTS preload directive',
        'missing': 'HSTS header missing indicator'
    };
    return descriptions[key] || 'HSTS configuration property';
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

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        return dateString;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        burpRecommendations.innerHTML = '<div class="no-burp-recommendations">No specific SSL/TLS attack vectors identified</div>';
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

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up storage if needed
    if (tabId) {
        chrome.storage.local.remove(`results_${tabId}`);
    }
}); 