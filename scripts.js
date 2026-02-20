// 1. Capture parameters from the URL (e.g., ?service=NS&ward=PRI)
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

// 2. Your specific Google Apps Script Web App URL
const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

// Global variable to store data once fetched
let dutyData = null;

/**
 * Main function to fetch data from the Google Sheets API (Hybrid Code.gs)
 */
async function fetchDutyData() {
    console.log("Starting fetch process...");

    // Basic validation: If URL is just mhub96.github.io/QR/ without extras
    if (!service || !ward) {
        console.error("Missing Service or Ward parameters in URL.");
        const btn = document.getElementById('unlock-btn');
        if (btn) {
            btn.innerText = "رابط غير صالح ⚠️";
            btn.style.background = "#dc3545";
        }
        return;
    }

    try {
        // Construct the URL with the json=true flag for our Hybrid script
        const finalUrl = `${webAppUrl}?service=${encodeURIComponent(service)}&ward=${encodeURIComponent(ward)}&json=true`;
        
        console.log("Fetching from:", finalUrl);

        // 'redirect: follow' is crucial for Google Apps Script
        const response = await fetch(finalUrl, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received successfully:", data);

        if (data.error) {
            console.warn("API returned an error:", data.error);
            document.getElementById('unlock-btn').innerText = "لا يوجد خفر 📅";
            return;
        }

        // Store data and enable the UI
        dutyData = data;
        const btn = document.getElementById('unlock-btn');
        if (btn) {
            btn.disabled = false;
            btn.innerText = "دخول";
            btn.style.background = "var(--accent)";
        }

    } catch (err) {
        console.error("Critical Fetch Error:", err);
        const btn = document.getElementById('unlock-btn');
        if (btn) {
            btn.innerText = "فشل الاتصال 🌐";
            btn.style.background = "#C0392B";
        }
    }
}

/**
 * Handles the password check and UI transition
 */
function unlock() {
    const userInput = document.getElementById('pw').value;
    
    if (!dutyData) {
        console.warn("Unlock attempted before data loaded.");
        return;
    }

    // Verify password against data sent from Google
    if (userInput === dutyData.password) {
        console.log("Access Granted. Populating UI...");

        // Map data to HTML elements
        document.getElementById('service-display').innerText = dutyData.resident.serviceArabic || "القسم";
        document.getElementById('name-display').innerText = dutyData.resident.name || "الاسم غير متوفر";
        document.getElementById('phone-display').innerText = dutyData.resident.phone || "---";
        document.getElementById('time-display').innerText = dutyData.timestamp || "";

        // Update Phone Button
        const callBtn = document.getElementById('call-btn');
        callBtn.href = "tel:" + dutyData.resident.phone;

        // Update WhatsApp Button
        const waBtn = document.getElementById('wa-btn');
        if (dutyData.whatsappDigits) {
            waBtn.href = "https://wa.me/" + dutyData.whatsappDigits;
            waBtn.style.display = "flex";
        } else {
            waBtn.style.display = "none";
        }

        // Hide Lock Screen, Show Content
        document.getElementById('lock-screen').style.opacity = "0";
        setTimeout(() => {
            document.getElementById('lock-screen').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
        }, 300);

    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = "";
    }
}

// Ensure Enter key works for password submission
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const lockScreen = document.getElementById('lock-screen');
        if (lockScreen.style.display !== 'none') {
            unlock();
        }
    }
});

// Execute fetch on page load
fetchDutyData();
