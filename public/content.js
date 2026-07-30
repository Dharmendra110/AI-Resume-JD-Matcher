let atsButton = null;

console.log("✅ LinkedIn Content Script Loaded");

function getJobDescription() {

    const selectors = [
        ".jobs-description__content",
        ".jobs-box__html-content",
        ".jobs-description-content__text",
        ".jobs-search__job-details--container"
    ];

    for (const selector of selectors) {

        const el = document.querySelector(selector);

        if (el && el.innerText.trim().length > 100) {
            return el.innerText.trim();
        }
    }

    return null;
}

function createATSButton() {

    if (atsButton) return;

    atsButton = document.createElement("button");

    atsButton.innerText = "Check ATS Score";

    Object.assign(atsButton.style, {
        position: "fixed",
        bottom: "30px",
        right: "30px",
        background: "#0A66C2",
        color: "#fff",
        padding: "14px 20px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "15px",
        zIndex: "999999"
    });

    document.body.appendChild(atsButton);

    atsButton.addEventListener("click", () => {

        const jd = getJobDescription();

        if (!jd) {

            console.log("❌ Job Description Not Found");

            atsButton.innerText = "JD Not Found";

            setTimeout(() => {
                atsButton.innerText = "Check ATS Score";
            }, 2000);

            return;
        }

        console.log("✅ Sending JD to Background");
        console.log(jd);

        atsButton.innerText = "Checking...";

        chrome.runtime.sendMessage(
            {
                type: "CHECK_SCORE",
                jobDescription: jd
            },
            (response) => {

                if (chrome.runtime.lastError) {

                    console.error(chrome.runtime.lastError);

                    atsButton.innerText = "Extension Error";

                    return;
                }

                console.log("✅ Response From Background:", response);

                if (!response) {

                    atsButton.innerText = "No Response";

                    return;
                }

                chrome.storage.local.set(
                    {
                        atsResult: response
                    },
                    () => {

                        atsButton.innerText = "Done ✔";

                        setTimeout(() => {
                            atsButton.innerText = "Check ATS Score";
                        }, 1500);
                    }
                );
            }
        );
    });
}

function init() {

    if (!location.href.includes("/jobs/")) return;

    const jd = getJobDescription();

    if (jd) {

        console.log("✅ Job Description Found");

        createATSButton();

    }
}

const observer = new MutationObserver(() => {
    init();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// IMPORTANT: Initial page load par bhi run karo.
init();