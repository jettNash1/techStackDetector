// Technology Results JavaScript

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
        
        console.log('No direct tab data found, searching for most recent technology analysis...');
        
        // Fallback: get all results and find the most recent technology analysis
        const allData = await chrome.storage.local.get(null);
        const resultsKeys = Object.keys(allData).filter(key => key.startsWith('results_'));
        
        console.log('Available storage keys:', resultsKeys);
        
        let mostRecent = null;
        let mostRecentTime = 0;
        
        for (const key of resultsKeys) {
            const data = allData[key];
            console.log(`Checking ${key}:`, data);
            if (data && data.feature === 'technology' && data.timestamp > mostRecentTime) {
                mostRecent = data;
                mostRecentTime = data.timestamp;
                console.log('Found more recent technology data:', key);
            }
        }
        
        if (mostRecent) {
            console.log('Using most recent technology data:', mostRecent);
        } else {
            console.log('No technology analysis data found in storage');
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
        sessionStorage.setItem('analysisType', 'technology');
        
        // Update header information
        analyzedUrlElement.textContent = data.originalUrl;
        
        const analysisDate = new Date(data.data.analyzedAt || data.timestamp);
        analysisTimeElement.textContent = `Analysis Time: ${analysisDate.toLocaleString()}`;
        
        exportTime.textContent = `Exported: ${new Date().toLocaleString()}`;
        
        // Display technology summary
        displayTechnologySummary(data.data);
        
        // Display each technology category
        displayTechnologyCategory('server', data.data.server || [], 'serverTech');
        displayTechnologyCategory('framework', data.data.framework || [], 'frameworkTech');
        displayTechnologyCategory('javascript', data.data.javascript || [], 'javascriptTech');
        displayTechnologyCategory('css', data.data.css || [], 'cssTech');
        displayTechnologyCategory('cms', data.data.cms || [], 'cmsTech');
        displayTechnologyCategory('analytics', data.data.analytics || [], 'analyticsTech');
        displayTechnologyCategory('fonts', data.data.fonts || [], 'fontsTech');
        displayTechnologyCategory('security', data.data.security || [], 'securityTech');
        displayTechnologyCategory('development', data.data.development || [], 'developmentTech');
        displayTechnologyCategory('cdn', data.data.cdn || [], 'cdnTech');
        displayTechnologyCategory('other', data.data.other || [], 'otherTech');
        
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

function displayTechnologySummary(data) {
    const summaryElement = document.getElementById('techSummary');
    summaryElement.innerHTML = '';
    
    const categories = [
        { key: 'server', label: 'Server Tech' },
        { key: 'framework', label: 'Frameworks' },
        { key: 'javascript', label: 'JavaScript' },
        { key: 'css', label: 'CSS Frameworks' },
        { key: 'cms', label: 'CMS Platforms' },
        { key: 'analytics', label: 'Analytics' },
        { key: 'fonts', label: 'Fonts' },
        { key: 'security', label: 'Security Tools' },
        { key: 'development', label: 'Dev Tools' },
        { key: 'cdn', label: 'CDN Services' },
        { key: 'other', label: 'Other' }
    ];
    
    categories.forEach(category => {
        const count = (data[category.key] || []).length;
        const summaryItem = document.createElement('div');
        summaryItem.className = 'summary-item';
        summaryItem.innerHTML = `
            <span class="summary-count">${count}</span>
            <span class="summary-label">${category.label}</span>
        `;
        summaryElement.appendChild(summaryItem);
    });
}

function displayTechnologyCategory(categoryName, technologies, elementId) {
    const categoryElement = document.getElementById(elementId);
    categoryElement.innerHTML = '';
    
    if (!technologies || technologies.length === 0) {
        categoryElement.innerHTML = '<div class="no-tech">No technologies detected in this category</div>';
        return;
    }
    
    // Remove duplicates and count occurrences
    const techCounts = {};
    technologies.forEach(tech => {
        const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
        techCounts[techName] = (techCounts[techName] || 0) + 1;
    });
    
    Object.entries(techCounts).forEach(([techName, count]) => {
        const techItem = document.createElement('div');
        techItem.className = 'tech-item';
        
        const displayName = formatTechnologyName(techName);
        const countText = count > 1 ? ` (×${count})` : '';
        
        techItem.innerHTML = `
            <div class="tech-name">${escapeHtml(displayName)}${countText}</div>
            ${getTechnologyVersion(techName) ? `<div class="tech-version">${escapeHtml(getTechnologyVersion(techName))}</div>` : ''}
        `;
        
        categoryElement.appendChild(techItem);
    });
}

function displayAnalysisNotes(note) {
    const notesSection = document.getElementById('notesSection');
    const analysisNotes = document.getElementById('analysisNotes');
    
    if (note) {
        analysisNotes.textContent = note;
        notesSection.style.display = 'block';
    }
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
            case 'server':
                text = generateCategoryReport('Server Technologies', data.server || []);
                break;
            case 'framework':
                text = generateCategoryReport('Frameworks', data.framework || []);
                break;
            case 'javascript':
                text = generateCategoryReport('JavaScript Libraries', data.javascript || []);
                break;
            case 'css':
                text = generateCategoryReport('CSS Frameworks', data.css || []);
                break;
            case 'cms':
                text = generateCategoryReport('Content Management Systems', data.cms || []);
                break;
            case 'analytics':
                text = generateCategoryReport('Analytics & Tracking', data.analytics || []);
                break;
            case 'fonts':
                text = generateCategoryReport('Fonts & Typography', data.fonts || []);
                break;
            case 'security':
                text = generateCategoryReport('Security Tools', data.security || []);
                break;
            case 'development':
                text = generateCategoryReport('Development Tools', data.development || []);
                break;
            case 'cdn':
                text = generateCategoryReport('CDN Services', data.cdn || []);
                break;
            case 'other':
                text = generateCategoryReport('Other Technologies', data.other || []);
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
    
    let report = `TECHNOLOGY STACK DETECTION REPORT\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `URL: ${data.originalUrl}\n`;
    report += `Analysis Date: ${date.toLocaleString()}\n\n`;
    
    // Summary
    report += `TECHNOLOGY SUMMARY\n`;
    report += `${'-'.repeat(20)}\n`;
    const categories = [
        { key: 'server', label: 'Server Technologies' },
        { key: 'framework', label: 'Frameworks' },
        { key: 'javascript', label: 'JavaScript Libraries' },
        { key: 'css', label: 'CSS Frameworks' },
        { key: 'cms', label: 'CMS Platforms' },
        { key: 'analytics', label: 'Analytics & Tracking' },
        { key: 'fonts', label: 'Fonts & Typography' },
        { key: 'security', label: 'Security Tools' },
        { key: 'development', label: 'Development Tools' },
        { key: 'cdn', label: 'CDN Services' },
        { key: 'other', label: 'Other Technologies' }
    ];
    
    categories.forEach(category => {
        const count = (data.data[category.key] || []).length;
        report += `${category.label}: ${count}\n`;
    });
    report += '\n';
    
    // Detailed breakdown
    categories.forEach(category => {
        const technologies = data.data[category.key] || [];
        if (technologies.length > 0) {
            report += `${category.label.toUpperCase()}\n`;
            report += `${'-'.repeat(category.label.length)}\n`;
            
            const techCounts = {};
            technologies.forEach(tech => {
                const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
                techCounts[techName] = (techCounts[techName] || 0) + 1;
            });
            
            Object.entries(techCounts).forEach(([techName, count]) => {
                const countText = count > 1 ? ` (detected ${count} times)` : '';
                report += `- ${techName}${countText}\n`;
            });
            report += '\n';
        }
    });
    
    // Notes
    if (data.data.note) {
        report += `ANALYSIS NOTES\n`;
        report += `${'-'.repeat(14)}\n`;
        report += `${data.data.note}\n\n`;
    }
    
    return report;
}

function generateCategoryReport(categoryName, technologies) {
    let report = `${categoryName.toUpperCase()}\n`;
    report += `${'-'.repeat(categoryName.length)}\n`;
    
    if (!technologies || technologies.length === 0) {
        report += 'No technologies detected in this category\n';
        return report;
    }
    
    const techCounts = {};
    technologies.forEach(tech => {
        const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
        techCounts[techName] = (techCounts[techName] || 0) + 1;
    });
    
    Object.entries(techCounts).forEach(([techName, count]) => {
        const countText = count > 1 ? ` (detected ${count} times)` : '';
        report += `- ${techName}${countText}\n`;
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
            feature: 'technology',
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
                tool: 'PenTest Assistant - Technology Stack Detector',
                version: '1.5.0',
                analysisType: 'technology',
                url: currentData.originalUrl,
                timestamp: new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString(),
                exportedAt: new Date().toISOString()
            },
            analysis: {
                technologies: currentData.data || {},
                owaspMapping: currentData.data.owaspMapping || {},
                cvssScoring: currentData.data.cvssScoring || {},
                burpRecommendations: currentData.data.burpRecommendations || {}
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        downloadFile(jsonString, `technology-analysis-${formatDateForFilename()}.json`, 'application/json');
        showCopyNotification('JSON export downloaded successfully!');
    } catch (error) {
        console.error('JSON export failed:', error);
        showCopyNotification('JSON export failed');
    }
}

async function exportAsCSV() {
    if (!currentData) return;
    
    try {
        let csvContent = 'Category,Technology,Version,Confidence,Risk Level,Description\n';
        
        // Process all technology categories
        Object.entries(currentData.data || {}).forEach(([category, technologies]) => {
            if (Array.isArray(technologies)) {
                technologies.forEach(tech => {
                    if (tech && typeof tech === 'object') {
                        const techName = tech.name || tech.technology || tech;
                        const version = tech.version || 'Unknown';
                        const confidence = tech.confidence || 'Unknown';
                        const risk = getRiskLevel(category, techName);
                        const description = tech.description || getDefaultDescription(category);
                        
                        csvContent += `"${escapeCSV(formatCategoryName(category))}","${escapeCSV(techName)}","${escapeCSV(version)}","${escapeCSV(confidence)}","${risk}","${escapeCSV(description)}"\n`;
                    } else if (typeof tech === 'string') {
                        csvContent += `"${escapeCSV(formatCategoryName(category))}","${escapeCSV(tech)}","Unknown","Unknown","${getRiskLevel(category, tech)}","${escapeCSV(getDefaultDescription(category))}"\n`;
                    }
                });
            }
        });
        
        // Add Burp Recommendations
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
        
        downloadFile(csvContent, `technology-analysis-${formatDateForFilename()}.csv`, 'text/csv');
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
        xmlContent += `<pentest-analysis tool="PenTest Assistant" version="1.5.0" type="technology">\n`;
        xmlContent += `  <metadata>\n`;
        xmlContent += `    <url>${escapeXML(currentData.originalUrl)}</url>\n`;
        xmlContent += `    <timestamp>${new Date(currentData.data.analyzedAt || currentData.timestamp).toISOString()}</timestamp>\n`;
        xmlContent += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`;
        xmlContent += `  </metadata>\n`;
        
        xmlContent += `  <analysis>\n`;
        xmlContent += `    <technologies>\n`;
        
        // Process all technology categories
        Object.entries(currentData.data || {}).forEach(([category, technologies]) => {
            if (Array.isArray(technologies) && technologies.length > 0) {
                xmlContent += `      <category name="${escapeXML(formatCategoryName(category))}">\n`;
                technologies.forEach(tech => {
                    if (tech && typeof tech === 'object') {
                        const techName = tech.name || tech.technology || 'Unknown';
                        xmlContent += `        <technology>\n`;
                        xmlContent += `          <name>${escapeXML(techName)}</name>\n`;
                        xmlContent += `          <version>${escapeXML(tech.version || 'Unknown')}</version>\n`;
                        xmlContent += `          <confidence>${escapeXML(tech.confidence || 'Unknown')}</confidence>\n`;
                        xmlContent += `          <description>${escapeXML(tech.description || '')}</description>\n`;
                        xmlContent += `        </technology>\n`;
                    } else if (typeof tech === 'string') {
                        xmlContent += `        <technology>\n`;
                        xmlContent += `          <name>${escapeXML(tech)}</name>\n`;
                        xmlContent += `          <version>Unknown</version>\n`;
                        xmlContent += `          <confidence>Unknown</confidence>\n`;
                        xmlContent += `        </technology>\n`;
                    }
                });
                xmlContent += `      </category>\n`;
            }
        });
        
        xmlContent += `    </technologies>\n`;
        xmlContent += `  </analysis>\n`;
        xmlContent += `</pentest-analysis>`;
        
        downloadFile(xmlContent, `technology-analysis-${formatDateForFilename()}.xml`, 'application/xml');
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

function getRiskLevel(category, technology) {
    const tech = String(technology).toLowerCase();
    const cat = String(category).toLowerCase();
    
    // High risk technologies
    if (cat.includes('security') || tech.includes('debug') || tech.includes('dev') || 
        tech.includes('test') || tech.includes('admin') || tech.includes('staging')) {
        return 'High';
    }
    // Medium risk technologies  
    if (cat.includes('analytics') || cat.includes('tracking') || tech.includes('old') ||
        tech.includes('legacy') || tech.includes('deprecated')) {
        return 'Medium';
    }
    // Default to low risk
    return 'Low';
}

function getDefaultDescription(category) {
    const descriptions = {
        'server': 'Server-side technology detection',
        'framework': 'Web application framework',
        'javascript': 'Client-side JavaScript library',
        'css': 'CSS framework or library',
        'cms': 'Content management system',
        'analytics': 'Analytics and tracking service',
        'security': 'Security-related technology',
        'development': 'Development tool or framework'
    };
    return descriptions[category] || 'Detected web technology';
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
function formatTechnologyName(name) {
    // Handle common technology name formatting
    const nameMap = {
        'jquery': 'jQuery',
        'react': 'React',
        'angular': 'Angular',
        'vue.js': 'Vue.js',
        'bootstrap': 'Bootstrap',
        'wordpress': 'WordPress',
        'nodejs': 'Node.js',
        'express.js': 'Express.js',
        'next.js': 'Next.js',
        'nuxt.js': 'Nuxt.js'
    };
    
    const lowerName = name.toLowerCase();
    return nameMap[lowerName] || name;
}

function getTechnologyVersion(techName) {
    // This would ideally extract version information from detection
    // For now, returning null as version detection would require more complex analysis
    return null;
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
        burpRecommendations.innerHTML = '<div class="no-burp-recommendations">No specific attack vectors identified for detected technologies</div>';
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

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up storage if needed
    if (tabId) {
        chrome.storage.local.remove(`results_${tabId}`);
    }
}); 