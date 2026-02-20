// 1. Get parameters from the URL
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

// 2. YOUR WEB APP URL (Make sure this is the /exec link)
const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

let dutyData = null;

async function fetchDutyData() {
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('loader');
    const btn = document.getElementById('unlock-btn');

    if (!service || !ward) {
        if(btnText) btnText.innerText = "رابط غير مكتمل ⚠️";
        if(loader) loader.style.display = "none";
        return;
    }

    try {
        // We add a 'cache-buster' (cb) so the browser doesn't show old data
        const finalUrl = `${webAppUrl}?service=${encodeURIComponent(service)}&ward=${encodeURIComponent(ward)}&json=true&cb=${Date.now()}`;
        
        console.log("Connecting to Google Bridge...");

        const response = await fetch(finalUrl, {
            method: 'GET',
            // No headers allowed for Google Apps Script 'GET' requests
            mode: 'cors',
            redirect: 'follow' 
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        if (data.error) {
            console.error("API Error:", data.error);
            if(btnText) btnText.innerText = "لا يوجد خفر 📅";
            if(loader) loader.style.display = "none";
            return;
        }

        // Success: Store and Enable
        dutyData = data;
        if(btn) btn.disabled = false;
        if(btnText) btnText.innerText = "دخول";
        if(loader) loader.style.display = "none";

    } catch (err) {
        console.error("Connection failed:", err);
        if(btnText) btnText.innerText = "فشل الاتصال 🌐";
        if(loader) loader.style.display = "none";
    }
}

// Keep your unlock() function as is
function unlock() {
    const userInput = document.getElementById('pw').value;
    if (!dutyData) return;

    if (userInput === dutyData.password.toString()) {
        document.getElementById('service-display').innerText = dutyData.resident.serviceArabic;
        document.getElementById('name-display').innerText = dutyData.resident.name;
        document.getElementById('phone-display').innerText = dutyData.resident.phone;
        document.getElementById('time-display').innerText = dutyData.timestamp;
        document.getElementById('call-btn').href = "tel:" + dutyData.resident.phone;

        if (dutyData.whatsappDigits) {
            const waBtn = document.getElementById('wa-btn');
            waBtn.href = "https://wa.me/" + dutyData.whatsappDigits;
            waBtn.style.display = "flex";
        }

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = "";
    }
}

fetchDutyData();
