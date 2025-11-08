require('dotenv').config();
const PenTestAgent = require('../agents/pentestAgent');

/**
 * Simple test script to run the PenTest Agent directly
 * Usage: node test/testAgent.js [URL]
 */

async function runTest() {
  try {
    // Get URL from command line or use default
    const targetUrl = process.argv[2] || 'https://example.com';

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║       PENETRATION TESTER AGENT - TEST SUITE       ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Check API key
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ Error: GROQ_API_KEY not found in environment variables');
      console.error('   Please set it in your .env file\n');
      process.exit(1);
    }

    console.log(`Target URL: ${targetUrl}\n`);
    console.log('Starting security assessment...\n');

    // Initialize agent
    const agent = new PenTestAgent(process.env.GROQ_API_KEY);

    // Run penetration test
    const report = await agent.runPenTest(targetUrl);

    // Display results
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║                  TEST RESULTS                      ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log(`Risk Level: ${report.riskLevel}`);
    console.log(`Total Findings: ${report.totalFindings}\n`);

    console.log('─────────────────────────────────────────────────────');
    console.log('SUMMARY');
    console.log('─────────────────────────────────────────────────────');
    console.log(report.summary);
    console.log('');

    if (report.criticalFindings && report.criticalFindings.length > 0) {
      console.log('─────────────────────────────────────────────────────');
      console.log('CRITICAL FINDINGS');
      console.log('─────────────────────────────────────────────────────');
      report.criticalFindings.forEach((finding, i) => {
        console.log(`${i + 1}. ${finding}`);
      });
      console.log('');
    }

    if (report.findings && report.findings.length > 0) {
      console.log('─────────────────────────────────────────────────────');
      console.log('DETAILED FINDINGS');
      console.log('─────────────────────────────────────────────────────');
      report.findings.forEach((finding, i) => {
        console.log(`\n[${i + 1}] ${finding.title}`);
        console.log(`    Severity: ${finding.severity}`);
        console.log(`    ${finding.description}`);
      });
      console.log('');
    }

    if (report.recommendations && report.recommendations.length > 0) {
      console.log('─────────────────────────────────────────────────────');
      console.log('RECOMMENDATIONS');
      console.log('─────────────────────────────────────────────────────');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
      console.log('');
    }

    // Save report to file
    const fs = require('fs');
    const reportFilename = `pentest-report-${Date.now()}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    console.log(`\n✓ Full report saved to: ${reportFilename}\n`);

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║                 TEST COMPLETED                     ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest();
