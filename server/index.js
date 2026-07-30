const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const MODELS = require("./models");

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENROUTER_API_KEY;
let storedResume = null;

// --------------------
// Upload Resume
// --------------------
app.post("/storeResume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    storedResume = pdfData.text;

    res.json({
      success: true,
      message: "Resume stored successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to process PDF",
    });
  }
});

// --------------------
// Check Resume Status
// --------------------
app.get("/checkResume", (req, res) => {
  res.json({
    uploaded: storedResume !== null,
  });
});

// --------------------
// Remove Resume
// --------------------
app.post("/removeResume", (req, res) => {
  storedResume = null;

  res.json({
    success: true,
    message: "Resume removed",
  });
});

// --------------------
// AI Function
// --------------------
async function getAIScore(jd, resumeText) {
  for (const model of MODELS) {
    try {
      console.log(`🚀 Trying model: ${model}`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an ATS Resume Analyzer. Return ONLY valid JSON. No markdown. No explanation.",
            },
            {
              role: "user",
              content: `
Return ONLY this JSON format:

{
  "score": 0,
  "missingSkills": [],
  "matchingSkills": [],
  "improvementSuggestions": []
}

Job Description:
${jd}

Resume:
${resumeText}
`,
            },
          ],
          temperature: 0.2,
           max_tokens:700,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:9000",
            "X-Title": "ATS Checker",
          },
        }
      );

      console.log(`✅ Success with ${model}`);

      return response.data.choices[0].message.content;
    } catch (err) {
      console.error(`❌ ${model} failed`);
      console.error("Status:", err.response?.status);
      console.error(
        "Data:",
        JSON.stringify(err.response?.data, null, 2)
      );
      console.error("Message:", err.message);

      // Try next model
      continue;
    }
  }

  console.log("❌ All models failed");
  return null;
}
// --------------------
// Calculate Score
// --------------------
app.post("/calculateScore", async (req, res) => {
     console.log("✅ /calculateScore hit");
    console.log(req.body);
  try {
    if (!storedResume) {
      return res.json({
        error: "Upload resume first",
      });
    }

    const { jd } = req.body;

    if (!jd || !jd.trim()) {
      return res.json({
        error: "Job description missing",
      });
    }

    console.log("JD Length:", jd.length);
    console.log("Resume Length:", storedResume.length);

    const aiResult = await getAIScore(jd, storedResume);

    console.log("AI Result:", aiResult);

    if (!aiResult) {
      return res.json({
        error: "AI failed",
      });
    }

    const match = aiResult.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.json({
        error: "Invalid AI response",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON Parse Error:", e);

      return res.json({
        error: "AI returned invalid JSON",
      });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Calculate Score Error:", err);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});