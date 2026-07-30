console.log("✅ Background Service Worker Loaded");

chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 Extension Installed");
});

chrome.runtime.onStartup?.addListener(() => {
    console.log("🚀 Browser Started");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("📩 Message Received:", message);

    if (message.type !== "CHECK_SCORE") {
        sendResponse({
            error: "Unknown message type"
        });
        return;
    }

    if (!message.jobDescription) {
        console.error("❌ Job Description Missing");

        sendResponse({
            error: "Job Description Missing"
        });

        return;
    }

    console.log("📤 Sending request to backend...");

    fetch("http://localhost:9000/calculateScore", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jd: message.jobDescription
        })
    })
        .then(async (response) => {

            console.log("🌐 HTTP Status:", response.status);

            const data = await response.json();

            console.log("✅ Backend Response:", data);

            sendResponse(data);
        })
        .catch((error) => {

            console.error("❌ Fetch Error:", error);

            sendResponse({
                error: error.message
            });
        });

    return true;
});