# Penetration Tester Agent

An autonomous AI-powered agent for ethical web application penetration testing using the Groq API.

## Overview

The **Penetration Tester Agent** is an intelligent security assessment tool that combines automated vulnerability scanning with AI-powered analysis. It performs safe, non-destructive security tests on web applications and generates comprehensive security reports with actionable recommendations.

### Key Features

- **Autonomous Security Testing**: Automatically scans web applications for common vulnerabilities
- **AI-Powered Analysis**: Uses Groq's LLM for intelligent security assessment and recommendations
- **Non-Destructive Testing**: All tests are safe and do not exploit vulnerabilities
- **Comprehensive Reporting**: Generates detailed JSON or text reports with risk assessments
- **Multi-Tool Architecture**: Modular design with separate reconnaissance and vulnerability scanning tools

## Architecture

```
penetration-tester-agent/
├── agents/
│   └── pentestAgent.js       # Main orchestrator using Groq AI
├── tools/
│   ├── reconTool.js          # Reconnaissance tool
│   └── vulnerabilityTool.js  # Vulnerability scanner
├── routes/
│   └── pentestRoute.js       # API endpoints
├── server/
│   └── app.js                # Express server
├── .env.example              # Environment variables template
└── package.json
```

## What It Tests

### 1. Reconnaissance
- HTTP headers analysis
- Server information gathering
- Technology stack detection
- Cookie inspection

### 2. Vulnerability Scanning
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS Configuration**: Detects permissive or insecure CORS policies
- **Input Reflection**: Tests for XSS vulnerability indicators
- **SQL Injection**: Detects SQL error messages
- **Cookie Security**: Validates HttpOnly, Secure, and SameSite flags

### 3. AI Analysis
- Executive summary generation
- Risk prioritization
- Actionable security recommendations
- Overall risk assessment

## Prerequisites

- Node.js 16+
- Groq API key (get one at [https://console.groq.com](https://console.groq.com))
- Network access to target websites

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Sifen1995/Penetration-Tester-Agent.git
cd Penetration-Tester-Agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
NODE_ENV=development
```

## Usage

### Start the Server

```bash
npm start
```

Or use development mode with auto-reload:

```bash
npm run dev
```

### Run a Penetration Test

**Using curl:**

```bash
curl -X POST http://localhost:3000/api/pentest \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Using JavaScript/Node:**

```javascript
const response = await fetch('http://localhost:3000/api/pentest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});

const report = await response.json();
console.log(report);
```

**Using Python:**

```python
import requests

response = requests.post(
    'http://localhost:3000/api/pentest',
    json={'url': 'https://example.com'}
)

report = response.json()
print(report)
```

### Request Format

```json
{
  "url": "https://example.com",
  "format": "json"
}
```

**Parameters:**
- `url` (required): Target website URL
- `format` (optional): Response format - `"json"` (default) or `"text"`

### Response Format

```json
{
  "target": "https://example.com",
  "timestamp": "2025-11-08T10:30:00.000Z",
  "summary": "Medium risk application detected.",
  "riskLevel": "Medium",
  "riskAssessment": "Application has several security misconfigurations...",
  "totalFindings": 5,
  "findings": [
    {
      "title": "Missing Content-Security-Policy",
      "severity": "Medium",
      "description": "No CSP header found. Application may be vulnerable to XSS attacks.",
      "timestamp": "2025-11-08T10:30:01.000Z"
    }
  ],
  "criticalFindings": [
    "Missing Content-Security-Policy header",
    "Reflected input vulnerability detected"
  ],
  "recommendations": [
    "Implement a CSP header to mitigate XSS attacks",
    "Validate and sanitize user inputs before rendering",
    "Enable HSTS with includeSubDomains directive"
  ],
  "technicalDetails": {
    "reconnaissance": { ... },
    "vulnerabilityScan": { ... }
  },
  "generatedBy": "PenTester Agent v1.0"
}
```

## API Endpoints

### POST /api/pentest

Run a penetration test on a target URL.

**Request:**
```json
{
  "url": "https://example.com",
  "format": "json"
}
```

**Response:** Security report (JSON or text format)

### GET /api/health

Check API and Groq service health.

**Response:**
```json
{
  "status": "healthy",
  "groq": "connected",
  "timestamp": "2025-11-08T10:30:00.000Z"
}
```

### GET /

API documentation and usage information.

## Security & Ethics

### Important Notes

1. **Authorization Required**: Only test websites you own or have explicit permission to test
2. **Non-Destructive**: This tool performs passive security assessments only
3. **Legal Compliance**: Unauthorized security testing may be illegal in your jurisdiction
4. **Educational Purpose**: Designed for learning, security research, and authorized assessments

### Responsible Use

- Always obtain written permission before testing
- Do not use against production systems without approval
- Respect rate limits and server resources
- Report findings responsibly to website owners

## Development

### Project Structure

- **agents/pentestAgent.js**: Main orchestration logic and Groq integration
- **tools/reconTool.js**: Reconnaissance and information gathering
- **tools/vulnerabilityTool.js**: Vulnerability detection tests
- **routes/pentestRoute.js**: Express route handlers
- **server/app.js**: Express server configuration

### Adding New Tests

To add a new vulnerability test:

1. Add a new method to `tools/vulnerabilityTool.js`:
```javascript
async testNewVulnerability(url) {
  // Your test logic
  this.addFinding('Title', 'Severity', 'Description');
}
```

2. Call it from the `scan()` method:
```javascript
await this.testNewVulnerability(url);
results.testsPerformed.push('New Vulnerability');
```

## Troubleshooting

### Common Issues

**Error: GROQ_API_KEY not configured**
- Solution: Add your Groq API key to `.env` file

**Error: Unable to connect to target**
- Check target URL is accessible
- Verify network connectivity
- Ensure target allows external requests

**Timeout errors**
- Increase timeout in tool configurations
- Check if target has rate limiting

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License

## Acknowledgments

- Built with [Groq](https://groq.com) for AI-powered analysis
- Uses [Express.js](https://expressjs.com) for the REST API
- Security testing inspired by OWASP guidelines

## Roadmap

- [ ] Integration with OWASP ZAP API
- [ ] Custom test profiles
- [ ] Report export formats (PDF, HTML)
- [ ] Scheduled/recurring scans
- [ ] Multi-target batch scanning
- [ ] WebSocket support for real-time updates

## Contact

For questions or issues, please open an issue on GitHub.

---

**Disclaimer**: This tool is for authorized security testing only. Users are responsible for ensuring they have proper authorization before testing any web application.
