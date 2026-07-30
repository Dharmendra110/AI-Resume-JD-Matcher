// Upload Resume
document.getElementById("upload").onclick = async () => {
    const file = document.getElementById("resume").files[0];

    if (!file) {
        alert("Select resume first");
        return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
        await fetch("http://localhost:9000/storeResume", {
            method: "POST",
            body: formData
        });

        document.getElementById("status").innerText = "Resume uploaded ✔";
    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Upload failed ❌";
    }
};


// On Load
document.addEventListener("DOMContentLoaded", async () => {

    const status = document.getElementById("status");

    try {
        const res = await fetch("http://localhost:9000/checkResume");
        const apiData = await res.json();

        if (!apiData.uploaded) {
            status.innerText = "Upload resume first";
            status.style.color = "red";
        } else {
            status.innerText = "Resume ready ✔";
            status.style.color = "green";
        }
    } catch (err) {
        console.error(err);
        status.innerText = "Server error ❌";
    }


    // Load ATS Result
    chrome.storage.local.get("atsResult", (res) => {

        const atsData = res.atsResult;

        console.log("ATS DATA:", atsData);

        if (!atsData || atsData.error) return;

        // Score
        document.getElementById("score").innerText =
            "Score: " + (atsData.score ?? "N/A");


        // Clear old lists
        document.getElementById("missing").innerHTML = "";
        document.getElementById("matched").innerHTML = "";


        // Missing Skills
        (atsData.missingSkills || []).forEach(skill => {
            const li = document.createElement("li");
            li.innerText = skill;
            li.style.color = "red";
            document.getElementById("missing").appendChild(li);
        });


        // Matching Skills
        (atsData.matchingSkills || []).forEach(skill => {
            const li = document.createElement("li");
            li.innerText = skill;
            li.style.color = "green";
            document.getElementById("matched").appendChild(li);
        });

    });
});