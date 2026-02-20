// 1. Setup
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

let dutyData = null;

// 2. Immediate Fetch
async function fetchDutyData() {
    if (!service || !ward) return;

    try {
        const finalUrl = `${webAppUrl}?service=${service}&ward=${ward}&json=true`;
        const response = await fetch(finalUrl, { method: 'GET', mode: 'cors', redirect: 'follow' });
        const data = await response.json();
        
        if (data && !data.error) {
            dutyData = data;
            console.log("Data loaded from Google 🇮🇶");
            // Hide the spinner if data is ready
            const loader = document.getElementById('loader');
            if(loader) loader.style.display = "none";
        }
    } catch (err) {
        console.warn("Google Bridge failed, staying in offline mode.");
        const loader = document.getElementById('loader');
        if(loader) loader.style.display = "none";
    }
}

// 3. Unlock Logic
function unlock() {
    const userInput = document.getElementById('pw').value;
    
    // Fallback: If Google fails, password is '1234'
    const correctPassword = dutyData ? dutyData.password.toString() : "1234";

    if (userInput === correctPassword) {
        if (dutyData) {
            // Fill with Real Data
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
        } else {
            // Fill with Placeholder for testing
            document.getElementById('name-display').innerText = "فشل الاتصال - معاينة";
            document.getElementById('service-display').innerText = "يرجى التحقق من الإنترنت";
        }

        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = "";
    }
}

fetchDutyData();
