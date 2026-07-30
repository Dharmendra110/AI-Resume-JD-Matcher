import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [resumeName, setResumeName] = useState("");

  // Check if running inside Chrome Extension
const BASE_URL = "https://ai-resume-jd-matcher-wc5u.onrender.com";

  const isExtension =
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.storage?.local;

  useEffect(() => {
    if (!isExtension) {
      console.log("Running outside Chrome Extension");
      return;
    }

    chrome.storage.local.get(["atsResult", "resumeName"], (res) => {
      setData(res.atsResult || null);
      setResumeName(res.resumeName || "");
    });

    const listener = (changes) => {
      if (changes.atsResult) {
        setData(changes.atsResult.newValue);
      }

      if (changes.resumeName) {
        setResumeName(changes.resumeName.newValue || "");
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [isExtension]);

  const uploadResume = async () => {
    if (!file) {
      setStatus("Select resume first");
      return;
    }

    try {
      setStatus("Uploading...");

      const formData = new FormData();
      formData.append("resume", file);

     

     const response = await fetch(`${BASE_URL}/storeResume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      if (isExtension) {
        chrome.storage.local.set({
          resumeName: file.name,
        });
      }

      setResumeName(file.name);
      setStatus("Resume uploaded ✔");
    } catch (err) {
      console.error(err);
      setStatus("Upload failed ❌");
    }
  };

  const removeResume = async () => {
    try {
     const response = await fetch(`${BASE_URL}/removeResume`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Remove failed");
      }

      if (isExtension) {
        chrome.storage.local.remove(["atsResult", "resumeName"]);
      }

      setData(null);
      setResumeName("");
      setStatus("Resume removed ❌");
    } catch (err) {
      console.error(err);
      setStatus("Failed to remove resume");
    }
  };

  const getScoreLevel = (score) => {
    if (score >= 75) return { text: "High", color: "#16a34a" };
    if (score >= 50) return { text: "Medium", color: "#f59e0b" };
    return { text: "Low", color: "#dc2626" };
  };

  return (
    <div
      style={{
        width: "340px",
        padding: "15px",
        fontFamily: "Arial",
        background: "#f3f4f6",
      }}
    >
      {/* Upload Card */}
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Upload Resume</h3>

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={uploadResume}
          style={{
            width: "100%",
            marginTop: "10px",
            padding: "10px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Upload
        </button>

        <p
          style={{
            fontSize: "12px",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          {status}
        </p>
      </div>

      {/* Result Card */}
      <div
        style={{
          background: "white",
          padding: "15px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        {!data && (
          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Run "Check Score" on LinkedIn
          </p>
        )}

        {data?.error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
            }}
          >
            {data.error}
          </p>
        )}

        {data && !data.error && (
          <>
            <p
              style={{
                fontSize: "12px",
                color: "gray",
              }}
            >
              Resume: {resumeName || "Uploaded"}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ color: "#2563eb" }}>
                Score: {data.score}%
              </h2>

              <h3
                style={{
                  color: getScoreLevel(data.score).color,
                }}
              >
                {getScoreLevel(data.score).text}
              </h3>
            </div>

            <h4 style={{ color: "#16a34a" }}>
              Your Strengths
            </h4>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
              }}
            >
              {data.matchingSkills?.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "5px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <h4
              style={{
                color: "#dc2626",
                marginTop: "10px",
              }}
            >
              Skills to Improve
            </h4>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
              }}
            >
              {data.missingSkills?.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "5px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            {data.improvementSuggestions?.length > 0 && (
              <>
                <h4 style={{ marginTop: "10px" }}>
                  What You Should Improve
                </h4>

                <ul
                  style={{
                    fontSize: "12px",
                    paddingLeft: "16px",
                  }}
                >
                  {data.improvementSuggestions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            <button
              onClick={removeResume}
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "10px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Remove Resume
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;