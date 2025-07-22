// DOM elements
const currentUrlElement = document.getElementById('currentUrl');
const statusMessage = document.getElementById('statusMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const featureButtons = document.querySelectorAll('.feature-btn');

// State management
let currentTab = null;
let isProcessing = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', initializePopup);

async function initializePopup() {
    try {
        // Initialize theme
        await initializeTheme();
        
        // Get current active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tabs[0];
        
        if (currentTab) {
            currentUrlElement.textContent = currentTab.url;
            setupEventListeners();
        } else {
            showStatus('No active tab found', 'error');
        }
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        showStatus('Failed to initialize extension', 'error');
    }
}

function setupEventListeners() {
    // Add click listeners to feature buttons
    featureButtons.forEach(button => {
        button.addEventListener('click', handleFeatureClick);
        button.addEventListener('keydown', handleKeyDown);
    });
    
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
}

function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFeatureClick(event);
    }
}

async function handleFeatureClick(event) {
    if (isProcessing) return;
    
    const feature = event.currentTarget.dataset.feature;
    const featureName = getFeatureName(feature);
    
    try {
        setProcessingState(true);
        showStatus(`Analyzing ${featureName}...`, 'info');
        
        // Validate current tab
        if (!currentTab || !currentTab.url) {
            throw new Error('No valid tab found');
        }
        
        if (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://')) {
            throw new Error('Cannot analyze Chrome internal pages');
        }
        
        // Send message to background script
        const response = await chrome.runtime.sendMessage({
            action: 'analyze',
            feature: feature,
            url: currentTab.url,
            tabId: currentTab.id
        });
        
        if (response.success) {
            // Create results tab
            await openResultsTab(feature, response.data, currentTab.url);
            showStatus(`${featureName} analysis complete!`, 'success');
            
            // Close popup after short delay
            setTimeout(() => {
                window.close();
            }, 1000);
        } else {
            throw new Error(response.error || `Failed to analyze ${featureName}`);
        }
        
    } catch (error) {
        console.error('Feature analysis failed:', error);
        showStatus(error.message || `Failed to analyze ${featureName}`, 'error');
    } finally {
        setProcessingState(false);
    }
}

async function openResultsTab(feature, data, originalUrl) {
    try {
        // Create results page URL
        const resultsUrl = chrome.runtime.getURL(`results/${feature}.html`);
        
        // Create new tab
        const newTab = await chrome.tabs.create({
            url: resultsUrl,
            index: currentTab.index + 1
        });
        
        // Store data for the results page
        await chrome.storage.local.set({
            [`results_${newTab.id}`]: {
                feature,
                data,
                originalUrl,
                timestamp: Date.now()
            }
        });
        
    } catch (error) {
        console.error('Failed to open results tab:', error);
        throw new Error('Failed to open results tab');
    }
}

function getFeatureName(feature) {
    const names = {
        'headers': 'Header Inspector',
        'technology': 'Technology Stack Detector',
        'certificate': 'Certificate Analyzer'
    };
    return names[feature] || feature;
}

function setProcessingState(processing) {
    isProcessing = processing;
    
    // Toggle loading spinner
    if (processing) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
    
    // Disable/enable buttons
    featureButtons.forEach(button => {
        button.disabled = processing;
        if (processing) {
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        } else {
            button.style.opacity = '';
            button.style.cursor = 'pointer';
        }
    });
}

function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide status after 3 seconds for success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
}

// Handle errors globally
window.addEventListener('error', (event) => {
    console.error('Popup error:', event.error);
    showStatus('An unexpected error occurred', 'error');
    setProcessingState(false);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showStatus('An unexpected error occurred', 'error');
    setProcessingState(false);
});

// Theme Management
async function initializeTheme() {
    try {
        // Load saved theme preference
        const result = await chrome.storage.local.get(['theme']);
        const savedTheme = result.theme;
        
        // Determine theme to use
        let theme = savedTheme;
        if (!theme) {
            // Default to system preference
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        // Apply theme
        applyTheme(theme);
        updateThemeToggleIcon(theme);
        
    } catch (error) {
        console.error('Failed to initialize theme:', error);
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

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

function updateThemeToggleIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
    try {
        const result = await chrome.storage.local.get(['theme']);
        if (!result.theme) {
            // Only auto-switch if user hasn't set a preference
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
            updateThemeToggleIcon(newTheme);
        }
    } catch (error) {
        console.error('Failed to handle system theme change:', error);
    }
});

// Cleanup when popup is closed
window.addEventListener('beforeunload', () => {
    // Clean up any ongoing processes
    setProcessingState(false);
}); 