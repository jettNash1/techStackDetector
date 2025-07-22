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
document.addEventListener('DOMContentLoaded', initializePage);

async function initializePage() {
    try {
        tabId = await getCurrentTabId();
        
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

async function getCurrentTabId() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const paramTabId = urlParams.get('tabId');
        
        if (paramTabId) {
            return paramTabId;
        }
        
        // Fallback to current active tab
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs && tabs[0] ? tabs[0].id : null);
            });
        });
    } catch (error) {
        return null;
    }
}

async function loadResultsData(tabId) {
    try {
        // Try direct tab ID first
        if (tabId) {
            const result = await chrome.storage.local.get(`results_${tabId}`);
            if (result[`results_${tabId}`]) {
                return result[`results_${tabId}`];
            }
        }
        
        // Fallback: get all results and find the most recent certificate analysis
        const allData = await chrome.storage.local.get(null);
        const resultsKeys = Object.keys(allData).filter(key => key.startsWith('results_'));
        
        let mostRecent = null;
        let mostRecentTime = 0;
        
        for (const key of resultsKeys) {
            const data = allData[key];
            if (data.feature === 'certificate' && data.timestamp > mostRecentTime) {
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
    
    // Keyboard support
    document.querySelectorAll('.copy-section-btn, #copyAllBtn').forEach(btn => {
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

function showError(message) {
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = message;
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

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up storage if needed
    if (tabId) {
        chrome.storage.local.remove(`results_${tabId}`);
    }
}); 