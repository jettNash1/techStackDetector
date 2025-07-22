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
        
        // Fallback: get all results and find the most recent technology analysis
        const allData = await chrome.storage.local.get(null);
        const resultsKeys = Object.keys(allData).filter(key => key.startsWith('results_'));
        
        let mostRecent = null;
        let mostRecentTime = 0;
        
        for (const key of resultsKeys) {
            const data = allData[key];
            if (data.feature === 'technology' && data.timestamp > mostRecentTime) {
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

function showError(message) {
    loadingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorMessage.textContent = message;
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

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Clean up storage if needed
    if (tabId) {
        chrome.storage.local.remove(`results_${tabId}`);
    }
}); 