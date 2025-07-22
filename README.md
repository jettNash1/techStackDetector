# 🛡️ PenTest Assistant Browser Extension

A **professional-grade browser extension** designed for advanced penetration testing and security assessment. Powered by **PortSwigger Web Security Academy methodologies**, this extension provides comprehensive vulnerability detection, sophisticated attack vector analysis, and enterprise-level security recommendations that transform basic reconnaissance into professional penetration testing workflows.

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

### 🎓 PortSwigger Web Security Academy Integration (ENHANCED!)
This extension now incorporates **comprehensive vulnerability detection and testing methodologies** directly from PortSwigger's Web Security Academy, covering **60+ vulnerability categories** and providing **professional-grade exploitation guidance**.

**🔥 Complete Attack Surface Coverage (60+ Categories):**

**🎯 Injection Attacks (12 types):**
- SQL Injection, NoSQL Injection, XXE, SSTI, Command Injection, LDAP Injection
- XPath Injection, SMTP Header Injection, Host Header Injection, Code Injection
- Path Traversal, File Inclusion (LFI/RFI)

**🌐 Cross-Site & Client-Side (10 types):**
- XSS (Reflected/Stored/DOM/Mutation), CSRF, Clickjacking, DOM vulnerabilities
- PostMessage abuse, Prototype Pollution, CORS, WebSocket security
- Cross-Site WebSocket Hijacking, Reverse Tabnabbing

**🔐 Authentication & Authorization (8 types):**
- Authentication Bypass, Access Control Flaws, JWT Vulnerabilities, OAuth 2.0
- Session Management, Password Security, MFA Bypass, Certificate Pinning

**📡 API & Modern Web (12 types):**
- GraphQL Security, REST API, Web Cache Poisoning, HTTP Request Smuggling
- HTTP/2 Security, **Web LLM Attacks** (NEW!), SSRF, DNS Rebinding
- Out-of-Band Attacks, WAF Bypass, CSP Bypass, Subdomain Takeover

**💼 Business Logic & Advanced (18 types):**
- Race Conditions, Business Logic Flaws, Insecure Deserialization
- File Upload Vulnerabilities, Information Disclosure, Timing Attacks
- Cryptographic Vulnerabilities, Side-Channel Attacks, Logic Bombs, APT Indicators
- SSL/TLS, DNS Security, Email Security, CDN Security, Cloud Security
- Container Security, Microservices Security, Zero-Day Techniques

**🚀 Advanced Professional Methodologies:**
```
🔥 Advanced CSRF Exploitation
Risk: Account Takeover / Unauthorized Actions
🎯 Technique: PoC generation, JSON-based CSRF, SameSite bypass, referrer validation bypass
🔧 Extensions: CSRF PoC Generator, CSRF Scanner, Request Smuggler
👤 Manual: <form action="victim.com/transfer"><input name="amount" value="1000"></form>

⚡ File Upload Exploitation  
Risk: Remote Code Execution
🎯 Technique: Web shell upload, polyglot files, MIME bypass, path traversal
🔧 Extensions: Upload Scanner, File Upload Vulnerabilities, Polyglot Generator
👤 Manual: shell.php.jpg, shell.asp;.jpg, shell.php%00.jpg, polyglot GIF+PHP

🚀 Web LLM Attacks (Latest PortSwigger Topic!)
Risk: Prompt Injection / Data Exfiltration  
🎯 Technique: Prompt injection, jailbreaking, context poisoning, model manipulation
🔧 Extensions: LLM Security Scanner, Prompt Injection Tester, AI Security Scanner
👤 Manual: "Ignore previous instructions and...", system role manipulation

🌐 OAuth 2.0 Exploitation
Risk: Account Takeover / Authorization Bypass
🎯 Technique: redirect_uri manipulation, state bypass, code interception, scope escalation
🔧 Extensions: OAuth Scanner, Authorization Testing, JWT Editor
👤 Manual: redirect_uri=attacker.com, missing state, authorization code in referrer

💣 Race Condition Exploitation  
Risk: Financial Loss / Logic Bypass
🎯 Technique: Concurrent requests, timing attacks, TOCTTOU, limit bypass
🔧 Extensions: Race Condition Scanner, Turbo Intruder, Concurrent Request Sender
👤 Manual: Simultaneous money transfer, discount application, quantity manipulation
```

**🎖️ Professional Attack Scenarios:**
- **Enterprise Applications**: Advanced SQLi, XXE with OOB, SSTI sandbox escape, JWT algorithm confusion
- **Modern SPAs**: DOM XSS, PostMessage abuse, CORS exploitation, CSP bypass techniques  
- **API Security**: GraphQL introspection, REST parameter pollution, OAuth flow manipulation
- **Infrastructure**: HTTP request smuggling, cache poisoning, subdomain takeover, WAF bypass
- **AI/ML Applications**: LLM prompt injection, model manipulation, context poisoning
- **Business Logic**: Race conditions, workflow bypass, financial logic exploitation

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
6. **Use "Retry Analysis" button to re-scan with fresh data**

#### Technology Stack Detector
1. Navigate to the target application
2. Click the "Technology Stack Detector" button
3. Browse categorized technology findings
4. Review the technology summary for quick overview
5. Export specific categories or all results
6. **Use "Retry Analysis" button to re-scan with fresh data**

#### Certificate Analyzer
1. Ensure the site uses HTTPS (extension will note if HTTP is used)
2. Click the "Certificate Analyzer" button
3. Review certificate status and configuration
4. Check HSTS settings and recommendations
5. Export certificate analysis for reporting
6. **Use "Retry Analysis" button to re-scan with fresh data**

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

### Retry and Error Recovery
- **Smart Retry Functionality**: Re-analyze the same target URL even after page refresh
- **URL Persistence**: Original analyzed URL is automatically stored and preserved
- **Error Recovery**: Failed analyses can be retried with a single click
- **Fresh Data Collection**: Retry performs a completely new analysis with updated data
- **Session Persistence**: Analysis context maintained across browser sessions

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

### v1.3.0 (Latest) - Comprehensive PortSwigger Methodologies
- **🔥 MASSIVE UPDATE: 60+ Vulnerability Categories** - Complete coverage of PortSwigger Web Security Academy methodologies
- **🆕 Web LLM Attacks** - Latest PortSwigger topic: Prompt injection, model manipulation, context poisoning
- **⚡ Advanced CSRF & Clickjacking** - Comprehensive exploitation techniques including JSON CSRF, SameSite bypass, UI redressing
- **🌐 Enhanced CORS & WebSocket Security** - Subdomain takeover, origin bypass, message injection attacks
- **📁 File Upload Exploitation** - Polyglot files, MIME bypass, path traversal, web shell upload techniques
- **🔄 Race Condition Mastery** - Financial logic flaws, TOCTTOU attacks, concurrent request exploitation
- **🎭 OAuth 2.0 & JWT Advanced Attacks** - Authorization bypass, token manipulation, scope escalation
- **🛡️ WAF Bypass & Out-of-Band Techniques** - Encoding variations, DNS exfiltration, HTTP callbacks
- **🏗️ HTTP Request Smuggling & Cache Poisoning** - CL.TE attacks, parameter cloaking, cache deception
- **🧠 DOM Manipulation & Deserialization** - Client-side attacks, object injection, template compilation
- **📊 Professional Attack Scenarios** - Enterprise-grade exploitation guidance for all vulnerability classes
- **🔄 Enhanced Retry Functionality** - Smart retry buttons that work after page refresh with URL persistence
- **⚡ Improved Error Recovery** - Better error handling and seamless analysis retry capabilities

### v1.2.0 - PortSwigger Web Security Academy Integration
- **🎓 NEW: PortSwigger Academy Integration** - Advanced vulnerability detection based on 200+ Web Security Academy labs and techniques
- **🔥 Advanced Vulnerability Detection**: SQL injection, XXE, SSRF, SSTI, JWT attacks, GraphQL vulnerabilities, NoSQL injection, prototype pollution
- **🚀 Modern Attack Vectors**: HTTP request smuggling, web cache deception, host header injection, race conditions, business logic flaws
- **🛡️ Comprehensive Security Analysis**: 25+ vulnerability categories with PortSwigger-grade testing methodologies
- **⚡ Professional-Grade Recommendations**: Advanced Burp Suite techniques, specific payloads, and exploitation methodologies
- **🎯 Enhanced Attack Vector Engine**: Priority-based vulnerability assessment with real-world attack scenarios
- **📊 Enterprise-Level Reporting**: Detailed vulnerability analysis with specific testing procedures and remediation guidance

### v1.1.0
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

**⚠️ CRITICAL SECURITY DISCLAIMER**: This tool incorporates **advanced penetration testing methodologies** from PortSwigger's Web Security Academy and provides **professional-grade attack vectors** including SQL injection, XXE, SSTI, and other high-impact vulnerability exploitation techniques. 

**AUTHORIZED USE ONLY**: This tool is intended **EXCLUSIVELY** for:
- Authorized penetration testing engagements  
- Security assessments with explicit written permission
- Educational purposes in controlled environments
- Legitimate security research with proper authorization

**USER RESPONSIBILITY**: Users are **fully responsible** for:
- Obtaining explicit written authorization before testing
- Compliance with all applicable laws and regulations
- Following responsible disclosure practices
- Ensuring testing is conducted only in authorized environments

**LEGAL WARNING**: Unauthorized use of these techniques against systems you do not own or lack permission to test may violate applicable laws. The developers assume **no responsibility** for misuse of this tool. Use at your own risk and only with proper authorization. 