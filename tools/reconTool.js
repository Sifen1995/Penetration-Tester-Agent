const axios = require('axios');

/**
 * Reconnaissance Tool
 * Gathers public information about the target website
 * - HTTP headers
 * - Server information
 * - Technology stack indicators
 * - Cookies
 */

class ReconTool {
  constructor() {
    this.name = 'ReconTool';
  }

  /**
   * Perform reconnaissance on target URL
   * @param {string} url - Target URL to scan
   * @returns {Promise<Object>} Reconnaissance results
   */
  async scan(url) {
    try {
      console.log(`[${this.name}] Starting reconnaissance on: ${url}`);

      const results = {
        url: url,
        timestamp: new Date().toISOString(),
        headers: {},
        serverInfo: {},
        cookies: [],
        techStack: [],
        redirects: [],
        securityHeaders: {}
      };

      // Perform HTTP request with detailed response tracking
      const response = await axios.get(url, {
        maxRedirects: 5,
        validateStatus: () => true, // Accept any status code
        timeout: 10000,
        headers: {
          'User-Agent': 'PenTester-Agent/1.0 (Security Scanner)'
        }
      });

      // Extract headers
      results.headers = response.headers;
      results.statusCode = response.status;

      // Server information
      results.serverInfo = {
        server: response.headers['server'] || 'Not disclosed',
        poweredBy: response.headers['x-powered-by'] || 'Not disclosed',
        aspNetVersion: response.headers['x-aspnet-version'] || 'Not disclosed'
      };

      // Security headers analysis
      results.securityHeaders = {
        contentSecurityPolicy: response.headers['content-security-policy'] || null,
        strictTransportSecurity: response.headers['strict-transport-security'] || null,
        xFrameOptions: response.headers['x-frame-options'] || null,
        xContentTypeOptions: response.headers['x-content-type-options'] || null,
        xXssProtection: response.headers['x-xss-protection'] || null,
        referrerPolicy: response.headers['referrer-policy'] || null,
        permissionsPolicy: response.headers['permissions-policy'] || null
      };

      // Extract cookies
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        results.cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      }

      // Detect technology stack from headers and response
      results.techStack = this.detectTechStack(response);

      console.log(`[${this.name}] Reconnaissance completed successfully`);
      return results;

    } catch (error) {
      console.error(`[${this.name}] Error during reconnaissance:`, error.message);
      return {
        url: url,
        timestamp: new Date().toISOString(),
        error: error.message,
        errorType: error.code || 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Detect technology stack from response
   * @param {Object} response - Axios response object
   * @returns {Array<string>} Detected technologies
   */
  detectTechStack(response) {
    const tech = [];
    const headers = response.headers;
    const body = response.data ? response.data.toString() : '';

    // Server detection
    if (headers['server']) {
      tech.push(`Server: ${headers['server']}`);
    }

    // Framework detection
    if (headers['x-powered-by']) {
      tech.push(`Framework: ${headers['x-powered-by']}`);
    }

    // Content type
    if (headers['content-type']) {
      tech.push(`Content-Type: ${headers['content-type']}`);
    }

    // Common CMS/Framework signatures in HTML
    if (typeof body === 'string') {
      if (body.includes('wp-content')) tech.push('CMS: WordPress');
      if (body.includes('Joomla')) tech.push('CMS: Joomla');
      if (body.includes('Drupal')) tech.push('CMS: Drupal');
      if (body.includes('ng-app') || body.includes('ng-version')) tech.push('Frontend: Angular');
      if (body.includes('react')) tech.push('Frontend: React');
      if (body.includes('vue')) tech.push('Frontend: Vue.js');
    }

    return tech;
  }

  /**
   * Analyze security posture from reconnaissance data
   * @param {Object} reconData - Data from scan()
   * @returns {Object} Security analysis
   */
  analyzeSecurityPosture(reconData) {
    const issues = [];
    const good = [];

    if (!reconData.securityHeaders) {
      return { issues: ['Unable to analyze security headers'], good: [] };
    }

    const headers = reconData.securityHeaders;

    // Check for missing security headers
    if (!headers.contentSecurityPolicy) {
      issues.push('Missing Content-Security-Policy header');
    } else {
      good.push('Content-Security-Policy header present');
    }

    if (!headers.strictTransportSecurity) {
      issues.push('Missing Strict-Transport-Security (HSTS) header');
    } else {
      good.push('HSTS header present');
    }

    if (!headers.xFrameOptions) {
      issues.push('Missing X-Frame-Options header (clickjacking vulnerability)');
    } else {
      good.push('X-Frame-Options header present');
    }

    if (!headers.xContentTypeOptions) {
      issues.push('Missing X-Content-Type-Options header');
    } else {
      good.push('X-Content-Type-Options header present');
    }

    // Check server information disclosure
    if (reconData.serverInfo.server !== 'Not disclosed') {
      issues.push(`Server version disclosed: ${reconData.serverInfo.server}`);
    }

    if (reconData.serverInfo.poweredBy !== 'Not disclosed') {
      issues.push(`Technology stack disclosed: ${reconData.serverInfo.poweredBy}`);
    }

    return { issues, good };
  }
}

module.exports = ReconTool;
