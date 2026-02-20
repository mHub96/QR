const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

let dutyData = null;

async function fetchDutyData() {
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('loader');
    const btn = document.getElementById('unlock-btn');

    // --- EMERGENCY BYPASS TIMER ---
    // If it stays "Loading" for 5 seconds, show a bypass option
    setTimeout(() => {
        if (dutyData === null && btnText.innerText.includes("Loading")) {
            btnText.innerText = "دخول (وضع الأوفلاين)";
            btn.disabled = false;
            if(loader) loader.style.display = "none";
        }
    }, 5000);

    if (!service || !ward) {
        if(btnText) btnText.innerText = "رابط غير مكتمل ⚠️";
        if(loader) loader.style.display = "none";
        return;
    }

    try {
        const finalUrl = `${webAppUrl}?service=${encodeURIComponent(service)}&ward=${encodeURIComponent(ward)}&json=true&cb=${Date.now()}`;
        
        const response = await fetch(finalUrl, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow' 
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        
        if (data.error) {
            if(btnText) btnText.innerText = "لا يوجد خفر 📅";
            if(loader) loader.style.display = "none";
            return;
        }

        dutyData = data;
        btn.disabled = false;
        btnText.innerText = "دخول";
        if(loader) loader.style.display = "none";

    } catch (err) {
        console.error("Fetch failed:", err);
        // Don't kill the button, let them try offline mode
        btn.disabled = false;
        btnText.innerText = "دخول (فشل الاتصال)";
        if(loader) loader.style.display = "none";
    }
}

function unlock() {
    const userInput = document.getElementById('pw').value;
    const lockScreen = document.getElementById('lock-screen');
    const mainContent = document.getElementById('main-content');

    // If Google worked, use Google's password. Otherwise, use 1234 as fallback.
    const correctPassword = dutyData ? dutyData.password.toString() : "1234";

    if (userInput === correctPassword) {
        if (dutyData) {
            // Fill with real data
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
            // Fill with "Offline/Test" placeholders
            document.getElementById('name-display').innerText = "وضع المعاينة (تجربة)";
            document.getElementById('phone-display').innerText = "07XXXXXXXXX";
            document.getElementById('service-display').innerText = "لا يوجد اتصال";
        }

        lockScreen.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = "";
    }
}

fetchDutyData();
