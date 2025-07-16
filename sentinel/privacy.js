function computePrivacyScore() {
    const trackers = [
        'google-analytics.com', 'facebook.net', 'scorecardresearch.com', 'adsrvr.org'
    ];

    let score = 100;

    trackers.forEach(tracker => {
        if (document.documentElement.innerHTML.includes(tracker)) {
            score -= 20;
        }
    });

    const cookieCount = document.cookie.split(';').length;
    if (cookieCount > 10) score -= 10;

    const iframeCount = document.querySelectorAll('iframe').length;
    if (iframeCount > 5) score -= 10;

    console.log(`[AdBlocker X-Factor] Privacy Score for ${location.hostname}: ${score}/100`);
}

computePrivacyScore();