# 🛡️ PenTest Assistant Browser Extension

A comprehensive browser extension designed for penetration testing and security information gathering. This extension provides three powerful analysis tools plus **actionable Burp Suite attack vectors** to streamline your security assessment workflow from reconnaissance to exploitation.

## ✨ Features

### 1. 📋 Header Inspector
- **HTTP Response Headers Analysis**: Automatically collects and displays all HTTP response headers
- **Enhanced Security Assessment**: Identifies and evaluates 20+ security headers with weighted scoring
- **Security Score**: Provides a comprehensive numerical security score (0-100) based on header configuration
- **Server Information**: Extracts detailed server technology, CDN, load balancer, and application server details
- **Cookie Security Analysis**: Evaluates cookie security flags and identifies session hijacking risks
- **Information Disclosure Detection**: Identifies headers revealing sensitive server/framework information
- **Caching Configuration Analysis**: Examines cache headers and identifies potential poisoning risks
- **🎯 Burp Suite Attack Vectors**: Provides specific attack techniques and extension recommendations

**Enhanced Analysis Includes:**
- **20+ Security Headers**: CSP, CSP Report-Only, HSTS, X-Frame-Options, Feature Policy, Certificate Transparency, Public Key Pinning, etc.
- **Cookie Security**: Secure flag, HttpOnly, SameSite analysis with CSRF risk assessment
- **Information Leakage**: Debug headers, source maps, version disclosure detection
- **Caching Issues**: Cache poisoning vectors, header manipulation techniques
- **CDN Detection**: Cloudflare, Amazon CloudFront, Azure CDN, Fastly identification

### 2. 🔍 Technology Stack Detector
- **Comprehensive Technology Detection**: Identifies 200+ web technologies, frameworks, and libraries
- **Enhanced Categorization**: Organizes findings into 11 specialized categories
- **Duplicate Handling**: Automatically collates duplicate detections and shows occurrence counts
- **Version Detection**: Attempts to identify technology versions where possible
- **Security & Development Tools**: Detects security measures and development environments
- **🎯 Burp Suite Attack Vectors**: Technology-specific exploitation techniques and recommendations

**Expanded Detection Categories:**
- **Server Technologies**: Apache, Nginx, IIS, LiteSpeed, Caddy, Traefik identification
- **Frameworks**: React, Angular, Vue.js, Express.js, ASP.NET, Django, Rails (60+ frameworks)
- **JavaScript Libraries**: jQuery, Socket.io, Axios, Redux, GraphQL, HTMX, Alpine.js (40+ libraries)
- **CSS Frameworks**: Bootstrap, Tailwind CSS, Bulma, Foundation, Material UI, etc.
- **CMS Platforms**: WordPress, Drupal, Joomla, Magento, Shopify, Ghost, Craft CMS (15+ platforms)
- **Analytics & Tracking**: Google Analytics, Facebook Pixel, Hotjar, Mixpanel, etc.
- **Fonts & Typography**: Google Fonts, Font Awesome, Adobe Fonts, etc.
- **🛡️ Security Tools**: reCAPTCHA, hCaptcha, WAF detection, bot protection, CSP reporting
- **🔧 Development Tools**: Webpack, DevTools, source maps, error tracking, performance monitoring
- **🌐 CDN Services**: jsDelivr, unpkg, cdnjs, Google CDN, Microsoft CDN (12+ CDNs)
- **Other Technologies**: Additional specialized tools and services

### 3. 🔐 Certificate Analyzer
- **SSL/TLS Certificate Details**: Extracts comprehensive certificate information
- **Enhanced HSTS Analysis**: Evaluates HTTP Strict Transport Security with subdomain coverage assessment
- **Certificate Chain Information**: Displays certificate hierarchy when available
- **Expiration Monitoring**: Shows certificate validity periods with detailed recommendations
- **Certificate Pinning Detection**: Identifies public key pinning and certificate transparency
- **🎯 Burp Suite Attack Vectors**: SSL/TLS-specific attack techniques and bypass methods

**Enhanced Certificate Analysis:**
- Protocol and domain details with security assessment
- Certificate issuer, subject, and trust chain validation
- Validity dates and expiration warnings with timeline recommendations
- HSTS configuration with max-age evaluation and subdomain inclusion analysis
- Certificate transparency and public key pinning detection
- SSL/TLS attack vectors: certificate substitution, mixed content, SSL stripping techniques

### 🎯 Burp Suite Attack Vectors (NEW!)
The extension now provides **intelligent attack vector recommendations** based on discovered vulnerabilities and technologies, transforming reconnaissance into actionable penetration testing guidance.

**Smart Analysis Engine:**
- **Priority-Based Recommendations**: High/Medium/Low priority attack vectors with color-coded risk indicators
- **Technology-Specific Attacks**: Framework-specific exploitation techniques (React XSS, WordPress vulnerabilities, etc.)
- **Security Gap Analysis**: Correlates missing security headers with specific attack techniques
- **Automated Burp Setup**: Provides exact extension recommendations and scanner configurations

**Attack Vector Categories:**
- **🔴 High Priority**: Critical vulnerabilities requiring immediate attention (missing CSP, CSRF vulnerabilities, debug information exposure)
- **🟡 Medium Priority**: Important security issues with moderate risk (framework vulnerabilities, weak HSTS policies, cookie security)
- **🟢 Low Priority**: Information disclosure and reconnaissance opportunities (version disclosures, cache misconfigurations)

**Burp Suite Integration:**
- **Specific Techniques**: Exact payloads and testing methodologies for each vulnerability
- **Extension Recommendations**: Curated list of Burp extensions for each attack type (XSS Validator, DOM Invader, etc.)
- **Scanner Configuration**: Tailored scanner settings for detected technologies and vulnerabilities
- **Manual Testing Steps**: Step-by-step manual testing procedures with specific parameters

**Example Attack Vectors:**
```
🔴 HIGH PRIORITY: CSRF Protection
Description: Cookies without SameSite protection - CSRF possible
🎯 Burp Technique: Generate CSRF PoCs, test cross-origin requests
🔧 Extensions: CSRF PoC Generator, CSRF Scanner
👤 Manual Testing: Test form submission from external domain

🟡 MEDIUM PRIORITY: React Framework
Description: React application detected
🎯 Burp Technique: Test DOM-based XSS, client-side template injection
🔧 Extensions: DOM Invader, XSS Validator, JavaScript Security Scanner
⚙️ Scanner Config: Enable DOM-based vulnerability scanning
```

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

### Burp Suite Attack Vectors
Every analysis now includes a dedicated **"🎯 Burp Suite Attack Vectors"** section that provides:
1. **Prioritized Attack Roadmap**: Color-coded recommendations based on discovered vulnerabilities
2. **Specific Burp Techniques**: Exact testing methodologies and payloads for each vulnerability
3. **Extension Setup Guide**: Curated list of essential Burp extensions for the detected attack vectors
4. **Scanner Configuration**: Tailored scanner settings optimized for the target's technology stack
5. **Manual Testing Procedures**: Step-by-step manual testing instructions with specific parameters

### Copy and Export Features
- **Copy All Results**: Exports complete analysis including attack vectors in text format
- **Copy Section**: Exports specific sections (headers, server info, attack vectors, etc.)
- **Copy Attack Vectors**: Dedicated export for Burp Suite recommendations and setup instructions
- **Clipboard Integration**: All copy operations use the system clipboard
- **Formatted Output**: Text exports are formatted for easy readability in reports and testing documentation

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Uses the latest Chrome extension manifest version
- **Enhanced Service Worker**: Background script with intelligent analysis engine and attack vector correlation
- **Advanced Content Scripts**: Deep DOM analysis with 200+ technology detection patterns
- **Smart Recommendation Engine**: AI-powered vulnerability assessment with Burp Suite integration
- **Modern UI**: Professional, responsive interface with accessibility features and real-time attack vector display

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
├── background.js              # Enhanced analysis engine with attack vector correlation
├── content.js                 # Advanced DOM analysis with 200+ detection patterns
├── styles/
│   ├── popup.css             # Interface styling
│   └── results.css           # Enhanced results styling with attack vector UI
├── results/
│   ├── headers.html          # Header analysis + Burp attack vectors
│   ├── technology.html       # Technology detection + framework-specific attacks
│   └── certificate.html     # Certificate analysis + SSL/TLS attack vectors
├── scripts/
│   ├── headers-results.js    # Header results + security attack recommendations
│   ├── technology-results.js # Technology results + tech-specific vulnerabilities
│   └── certificate-results.js # Certificate results + SSL attack techniques
├── icons/                    # Extension icons
└── README.md                 # This documentation
```

## 🛡️ Security Considerations

### Ethical Use
This extension is designed for **legitimate security testing and assessment purposes only**. The inclusion of attack vectors and Burp Suite recommendations significantly increases the tool's capability and responsibility. Users should:
- Only analyze websites they own or have explicit permission to test
- Comply with applicable laws and regulations
- Respect website terms of service and robots.txt files
- Use findings responsibly for security improvement purposes
- **⚠️ CRITICAL**: Use attack vectors only in authorized penetration testing environments
- Ensure proper authorization before implementing any suggested attack techniques
- Follow responsible disclosure practices for discovered vulnerabilities

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

### v1.1.0 (Latest)
- **🎯 NEW: Burp Suite Attack Vectors** - Intelligent attack recommendations with priority-based vulnerability assessment
- **Enhanced Header Inspector**: Cookie security analysis, information disclosure detection, caching configuration analysis
- **Expanded Technology Detection**: 200+ technologies across 11 categories including security tools, development tools, and CDN services
- **Advanced Security Scoring**: Weighted scoring system with 20+ security headers evaluation
- **Professional Attack Vector UI**: Color-coded priority system with specific Burp Suite integration guidance
- **Comprehensive Export**: Attack vectors included in all copy/export functionality
- **Enhanced User Experience**: Improved spacing, professional styling, and accessibility features

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

**⚠️ IMPORTANT DISCLAIMER**: This tool provides comprehensive security analysis including specific attack vectors and exploitation techniques. It is intended **EXCLUSIVELY** for legitimate security testing, authorized penetration testing, and educational purposes. Users are fully responsible for ensuring they have explicit written authorization before analyzing any websites or applications and implementing any suggested attack techniques. The developer assumes no responsibility for misuse of this tool. Always follow responsible disclosure practices and applicable laws and regulations. 