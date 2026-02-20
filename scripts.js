// 1. Get Service & Ward from the URL parameters (e.g., ?service=NS&ward=PRI)
const urlParams = new URLSearchParams(window.location.search);
const service = urlParams.get('service');
const ward = urlParams.get('ward');

// 2. Your Hybrid Google Web App URL
const webAppUrl = "https://script.google.com/macros/s/AKfycbzXPOdLnXVLfDNNj_WfVS4tT1HCb6qBzo5lghvX-pYZwCoCV4zcM5NOrJ5Jwp6x4qsJfg/exec";

// Global variable to hold the data once fetched
let dutyData = null;

// 3. Fetch data immediately when the page loads
async function fetchDutyData() {
    if (!service || !ward) {
        alert("⚠️ خطأ في الرابط: القسم أو الجناح مفقود");
        return;
    }

    try {
        // We add '&json=true' to trigger the JSON mode of your Hybrid Code.gs
        const finalUrl = `${webAppUrl}?service=${service}&ward=${ward}&json=true`;
        
        const response = await fetch(finalUrl);
        const data = await response.json();

        if (data.error) {
            console.error("Logic Error:", data.error);
            alert("⚠️ لم يتم العثور على خفر حالياً");
        } else {
            dutyData = data; // Store the data for the unlock function
            console.log("Data loaded successfully 🇮🇶");
        }
    } catch (err) {
        console.error("Fetch failed:", err);
        alert("⚠️ فشل الاتصال بالخادم. تأكد من الإنترنت.");
    }
}

// 4. The Unlock Function
function unlock() {
    const userInput = document.getElementById('pw').value;
    
    if (!dutyData) {
        alert("⏳ جاري تحميل البيانات... انتظر لحظة");
        return;
    }

    // Compare user input to the password sent by Google
    if (userInput === dutyData.password) {
        // Populate the HTML with the doctor's info
        document.getElementById('service-display').innerText = dutyData.resident.serviceArabic;
        document.getElementById('name-display').innerText = dutyData.resident.name;
        document.getElementById('phone-display').innerText = dutyData.resident.phone;
        document.getElementById('call-btn').href = "tel:" + dutyData.resident.phone;
        
        // WhatsApp button logic
        const waBtn = document.getElementById('wa-btn');
        if (dutyData.whatsappDigits) {
            waBtn.href = "whatsapp://send?phone=" + dutyData.whatsappDigits;
            waBtn.style.display = "flex";
        } else {
            waBtn.style.display = "none";
        }

        document.getElementById('time-display').innerText = dutyData.timestamp;

        // Visual switch: Hide lock, show content
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } else {
        alert('الرمز غير صحيح ❌');
        document.getElementById('pw').value = ""; // Clear the box
    }
}

// Allow "Enter" key to submit the password
document.addEventListener('DOMContentLoaded', () => {
    const pwInput = document.getElementById('pw');
    if(pwInput) {
        pwInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') unlock();
        });
    }
});

// Run the fetch on load
fetchDutyData();
