# 🛡️ PenTest Assistant Browser Extension

A comprehensive browser extension designed for penetration testing and security information gathering. This extension provides three powerful tools to analyze websites for security assessments and reconnaissance.

## ✨ Features

### 1. 📋 Header Inspector
- **HTTP Response Headers Analysis**: Automatically collects and displays all HTTP response headers
- **Security Headers Assessment**: Identifies and evaluates critical security headers
- **Security Score**: Provides a numerical security score (0-100) based on header configuration
- **Server Information**: Extracts server technology and configuration details
- **Security Recommendations**: Suggests improvements for better security posture

**Analyzed Headers Include:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy
- Permissions Policy
- Cross-Origin policies

### 2. 🔍 Technology Stack Detector
- **Comprehensive Technology Detection**: Identifies web technologies, frameworks, and libraries
- **Categorized Results**: Organizes findings into logical categories
- **Duplicate Handling**: Automatically collates duplicate detections and shows occurrence counts
- **Version Detection**: Attempts to identify technology versions where possible

**Detection Categories:**
- **Server Technologies**: Apache, Nginx, IIS, Cloudflare, etc.
- **Frameworks**: React, Angular, Vue.js, Express.js, ASP.NET, etc.
- **JavaScript Libraries**: jQuery, Bootstrap, D3.js, Chart.js, etc.
- **CSS Frameworks**: Bootstrap, Tailwind CSS, Bulma, Foundation, etc.
- **CMS Platforms**: WordPress, Drupal, Joomla, Magento, Shopify, etc.
- **Analytics & Tracking**: Google Analytics, Facebook Pixel, Hotjar, etc.
- **Fonts & Typography**: Google Fonts, Font Awesome, Adobe Fonts, etc.

### 3. 🔐 Certificate Analyzer
- **SSL/TLS Certificate Details**: Extracts comprehensive certificate information
- **HSTS Configuration Analysis**: Evaluates HTTP Strict Transport Security settings
- **Certificate Chain Information**: Displays certificate hierarchy when available
- **Expiration Monitoring**: Shows certificate validity periods
- **Security Recommendations**: Provides certificate-specific security advice

**Certificate Information:**
- Protocol and domain details
- Certificate issuer and subject
- Validity dates and expiration warnings
- HSTS configuration and recommendations
- Certificate-related security headers

## 🚀 Installation

### From Source (Development)

1. **Clone or Download** this repository to your local machine
2. **Open Chrome/Edge** and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. **Enable Developer Mode** by toggling the switch in the top-right corner
4. **Click "Load unpacked"** and select the extension directory
5. **Replace Icon Files** (optional):
   - Replace placeholder icon files in the `icons/` directory with proper PNG icons
   - Maintain the same file names and sizes (16x16, 32x32, 48x48, 128x128)

### Browser Compatibility
- ✅ Google Chrome (Manifest V3)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Other Chromium-based browsers

## 📖 Usage

### Getting Started
1. **Click the extension icon** in your browser toolbar
2. **Navigate to any website** you want to analyze
3. **Choose an analysis tool** by clicking one of the three buttons
4. **View results** in a new tab with formatted, styled output

### Using Each Tool

#### Header Inspector
1. Visit the target website
2. Click the "Header Inspector" button
3. Review the security score and headers analysis
4. Check security recommendations for improvements
5. Use copy buttons to export findings

#### Technology Stack Detector
1. Navigate to the target application
2. Click the "Technology Stack Detector" button
3. Browse categorized technology findings
4. Review the technology summary for quick overview
5. Export specific categories or all results

#### Certificate Analyzer
1. Ensure the site uses HTTPS (extension will note if HTTP is used)
2. Click the "Certificate Analyzer" button
3. Review certificate status and configuration
4. Check HSTS settings and recommendations
5. Export certificate analysis for reporting

### Copy and Export Features
- **Copy All Results**: Exports complete analysis in text format
- **Copy Section**: Exports specific sections (headers, server info, etc.)
- **Clipboard Integration**: All copy operations use the system clipboard
- **Formatted Output**: Text exports are formatted for easy readability in reports

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension manifest version
- **Service Worker**: Background script handles data collection and analysis
- **Content Scripts**: Analyzes DOM and page-specific information
- **Modern UI**: Professional, responsive interface with accessibility features

### Permissions Required
- `activeTab`: Access to the current active tab for analysis
- `tabs`: Create new tabs for results display
- `storage`: Temporary storage for analysis results
- `webRequest`: Access to HTTP headers and request information
- `clipboardWrite`: Copy functionality for exporting results
- `<all_urls>`: Access to analyze any website

### File Structure
```
techStackDetector/
├── manifest.json              # Extension configuration
├── popup.html                 # Main interface
├── popup.js                   # Interface logic
├── background.js              # Analysis engine
├── content.js                 # DOM analysis
├── styles/
│   ├── popup.css             # Interface styling
│   └── results.css           # Results page styling
├── results/
│   ├── headers.html          # Header analysis results
│   ├── technology.html       # Technology detection results
│   └── certificate.html     # Certificate analysis results
├── scripts/
│   ├── headers-results.js    # Header results logic
│   ├── technology-results.js # Technology results logic
│   └── certificate-results.js # Certificate results logic
├── icons/                    # Extension icons
└── README.md                 # This file
```

## 🛡️ Security Considerations

### Ethical Use
This extension is designed for **legitimate security testing and assessment purposes only**. Users should:
- Only analyze websites they own or have explicit permission to test
- Comply with applicable laws and regulations
- Respect website terms of service and robots.txt files
- Use findings responsibly for security improvement purposes

### Privacy
- **No Data Collection**: The extension does not collect or transmit personal data
- **Local Processing**: All analysis is performed locally in the browser
- **Temporary Storage**: Results are stored temporarily and cleaned up automatically
- **No External Requests**: No data is sent to external servers

### Limitations
- **Client-Side Analysis**: Limited to information available in the browser
- **Certificate Details**: Full certificate chain analysis may require additional permissions
- **Dynamic Content**: May not detect technologies loaded after initial page load
- **Browser Restrictions**: Cannot analyze Chrome internal pages or extension pages

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Make changes to the relevant files
3. Test in Chrome with Developer Mode enabled
4. Ensure all features work correctly
5. Submit pull requests with detailed descriptions

### Feature Requests
- Open an issue describing the requested feature
- Include use cases and security relevance
- Consider implementation complexity and browser limitations

### Bug Reports
- Provide detailed reproduction steps
- Include browser version and extension version
- Attach error logs or console output if applicable

## 📝 License

This project is provided for educational and professional security testing purposes. Please ensure you have proper authorization before using this tool for website analysis.

## 🔄 Version History

### v1.0.0
- Initial release with three core analysis tools
- Header Inspector with security scoring
- Technology Stack Detector with comprehensive framework detection
- Certificate Analyzer with HSTS evaluation
- Professional UI with copy/export functionality
- Comprehensive error handling and accessibility features

## 📞 Support

For issues, questions, or suggestions:
1. Check the documentation and README
2. Review existing issues in the repository
3. Create a new issue with detailed information
4. Consider contributing improvements via pull requests

---

**Disclaimer**: This tool is intended for legitimate security testing and educational purposes only. Users are responsible for ensuring they have proper authorization before analyzing any websites or applications. 