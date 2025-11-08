// State management
let currentReport = null;
let currentFormat = 'json';

// DOM Elements
const scanForm = document.getElementById('scanForm');
const targetUrl = document.getElementById('targetUrl');
const scanButton = document.getElementById('scanButton');
const loadingState = document.getElementById('loadingState');
const loadingPhase = document.getElementById('loadingPhase');
const resultsSection = document.getElementById('resultsSection');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const scanSection = document.querySelector('.scan-section');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    scanForm.addEventListener('submit', handleScan);

    document.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentFormat = e.target.value;
        });
    });

    document.getElementById('newScanButton')?.addEventListener('click', resetScan);
    document.getElementById('retryButton')?.addEventListener('click', resetScan);
    document.getElementById('downloadJsonButton')?.addEventListener('click', downloadJson);
    document.getElementById('copyButton')?.addEventListener('click', copyReport);
    document.getElementById('downloadTextButton')?.addEventListener('click', downloadText);
}

async function handleScan(e) {
    e.preventDefault();

    const url = targetUrl.value.trim();
    if (!url) return;

    // Show loading state
    showLoading();

    try {
        // Animate progress steps
        animateProgressSteps();

        // Make API call
        const response = await fetch('/api/pentest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                format: currentFormat
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Scan failed');
        }

        // Get response
        if (currentFormat === 'json') {
            currentReport = await response.json();
            displayJsonReport(currentReport);
        } else {
            currentReport = await response.text();
            displayTextReport(currentReport);
        }

        showResults();

    } catch (error) {
        console.error('Scan error:', error);
        showError(error.message);
    }
}

function showLoading() {
    scanSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    scanButton.disabled = true;
}

function showResults() {
    loadingState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    scanButton.disabled = false;
}

function showError(message) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
    scanButton.disabled = false;
}

function resetScan() {
    scanSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.add('hidden');
    targetUrl.value = '';
    currentReport = null;

    // Reset progress steps
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
}

function animateProgressSteps() {
    const steps = document.querySelectorAll('.step');
    const phases = [
        'Gathering reconnaissance data...',
        'Scanning for vulnerabilities...',
        'Analyzing with AI...',
        'Generating report...'
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
        if (currentStep > 0) {
            steps[currentStep - 1].classList.remove('active');
            steps[currentStep - 1].classList.add('completed');
        }

        if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            loadingPhase.textContent = phases[currentStep];
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
}

function displayJsonReport(report) {
    // Hide text report, show JSON report
    document.getElementById('textReport').classList.add('hidden');
    document.getElementById('jsonReport').classList.remove('hidden');

    // Display summary
    document.getElementById('targetDisplay').textContent = report.target;

    const riskBadge = document.getElementById('riskLevel');
    riskBadge.textContent = report.riskLevel;
    riskBadge.className = `summary-value risk-badge ${report.riskLevel}`;

    document.getElementById('totalFindings').textContent = report.totalFindings || 0;

    // Executive summary
    document.getElementById('execSummary').textContent = report.summary || 'No summary available';

    // Critical findings
    if (report.criticalFindings && report.criticalFindings.length > 0) {
        document.getElementById('criticalSection').classList.remove('hidden');
        const criticalList = document.getElementById('criticalList');
        criticalList.innerHTML = '';
        report.criticalFindings.forEach(finding => {
            const li = document.createElement('li');
            li.textContent = finding;
            criticalList.appendChild(li);
        });
    } else {
        document.getElementById('criticalSection').classList.add('hidden');
    }

    // Detailed findings
    if (report.findings && report.findings.length > 0) {
        document.getElementById('findingsSection').classList.remove('hidden');
        const findingsList = document.getElementById('findingsList');
        findingsList.innerHTML = '';

        report.findings.forEach((finding, index) => {
            const card = document.createElement('div');
            card.className = `finding-card ${finding.severity}`;
            card.innerHTML = `
                <div class="finding-header">
                    <div class="finding-title">${index + 1}. ${finding.title}</div>
                    <span class="severity-badge ${finding.severity}">${finding.severity}</span>
                </div>
                <div class="finding-description">${finding.description}</div>
            `;
            findingsList.appendChild(card);
        });
    } else {
        document.getElementById('findingsSection').classList.add('hidden');
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
        document.getElementById('recommendationsSection').classList.remove('hidden');
        const recList = document.getElementById('recommendationsList');
        recList.innerHTML = '';
        report.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recList.appendChild(li);
        });
    } else {
        document.getElementById('recommendationsSection').classList.add('hidden');
    }
}

function displayTextReport(text) {
    // Hide JSON report, show text report
    document.getElementById('jsonReport').classList.add('hidden');
    document.getElementById('textReport').classList.remove('hidden');

    document.getElementById('textReportContent').textContent = text;
}

function downloadJson() {
    if (!currentReport) return;

    const dataStr = JSON.stringify(currentReport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pentest-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Report downloaded successfully!');
}

function downloadText() {
    if (!currentReport) return;

    const blob = new Blob([currentReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pentest-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Report downloaded successfully!');
}

function copyReport() {
    if (!currentReport) return;

    const textToCopy = JSON.stringify(currentReport, null, 2);

    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('Report copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy report', 'error');
    });
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
