// 1. Get parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

// 2. YOUR WEB APP URL - Ensure this is the "Executed" URL from the "Anyone" deployment
const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

let dutyData = null;

/**
 * Fetches data from the Google Script
 */
async function fetchDutyData() {
    const btn = document.getElementById('unlock-btn');
    
    // Check if URL has parameters
    if (!service || !ward) {
        if(btn) btn.innerText = "رابط غير صالح (نقص بيانات) ⚠️";
        console.error("URL is missing 'service' or 'ward' parameters.");
        return;
    }

    try {
        // Construct URL with json=true to trigger the JSON mode in Code.gs
        const finalUrl = `${webAppUrl}?service=${encodeURIComponent(service)}&ward=${encodeURIComponent(ward)}&json=true`;
        
        console.log("Attempting to connect to:", finalUrl);

        // Fetch with specific settings for Google Apps Script
        const response = await fetch(finalUrl, {
            method: 'GET',
            mode: 'cors', // Crucial for cross-domain requests
            redirect: 'follow' // Crucial for Google Script redirects
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        if (data.error) {
            if(btn) btn.innerText = "لا يوجد خفر حالياً 📅";
            console.error("Server returned error:", data.error);
            return;
        }

        // Successfully loaded data
        dutyData = data;
        if(btn) {
            btn.disabled = false;
            btn.innerText = "دخول";
            btn.style.background = "var(--accent)";
        }
        console.log("Data loaded successfully 🇮🇶");

    } catch (err) {
        console.error("Fetch Error:", err);
        if(btn) {
            btn.innerText = "فشل الاتصال بالسيرفر 🌐";
            btn.style.background = "#d63031";
        }
    }
}

/**
 * Validates password and shows content
 */
function unlock() {
    const userInput = document.getElementById('pw').value;
    const lockScreen = document.getElementById('lock-screen');
    const mainContent = document.getElementById('main-content');
    
    if (!dutyData) return;

    // Check password against the one sent from Google
    if (userInput === dutyData.password.toString()) {
        
        // Fill the HTML with the doctor's info
        document.getElementById('service-display').innerText = dutyData.resident.serviceArabic;
        document.getElementById('name-display').innerText = dutyData.resident.name;
        document.getElementById('phone-display').innerText = dutyData.resident.phone;
        document.getElementById('time-display').innerText = dutyData.timestamp;

        // Call Button
        document.getElementById('call-btn').href = "tel:" + dutyData.resident.phone;

        // WhatsApp Button
        const waBtn = document.getElementById('wa-btn');
        if (dutyData.whatsappDigits) {
            waBtn.href = "https://wa.me/" + dutyData.whatsappDigits;
            waBtn.style.display = "flex";
        }

        // Transition: Hide lock, Show content
        lockScreen.style.display = 'none';
        mainContent.style.display = 'block';
        
    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = "";
    }
}

// Enable "Enter" key for password input
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.getElementById('lock-screen').style.display !== 'none') {
            unlock();
        }
    }
});

// Start the fetch when the page finishes loading
window.addEventListener('load', fetchDutyData);
