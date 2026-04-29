const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

// fetch for Gemini API
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;

// 🔴 YOUR GEMINI API KEY
const API_KEY = "AIzaSyAPorT5ChWXsEwcMeSr_WqMmDI20gV6o-Q";

// ===============================
// 📦 LOAD JSON DATA
// ===============================
const scholarships = require("./data/scholarships.json");

// ===============================
// 🗄️ MySQL CONNECTION
// ===============================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "GSB@#$550",
  database: "careerboost_db"
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Error:", err.message);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ===============================
// ⚙️ MIDDLEWARE
// ===============================
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ===============================
// 🎓 COLLEGE API (FIXED 🔥)
// ===============================
app.get("/api/colleges", (req, res) => {
  let { percentile, category, branch } = req.query;

  percentile = parseFloat(percentile) || 100;
  branch = (branch || "").toLowerCase().trim();
  category = (category || "").trim();

  console.log("📥 Request:", { percentile, category, branch });

  let query = `
    SELECT 
      college_name AS College_Name,
      course_name AS Branch,
      category AS Category,
      percentile AS Cutoff
    FROM cutoffs
    WHERE percentile <= ?
  `;

  let params = [percentile + 0.5];

  // 🔥 CATEGORY FIX (handles NULL / empty)
  if (category) {
    query += " AND (category = ? OR category IS NULL OR category = '')";
    params.push(category);
  }

  // 🔥 SMART BRANCH MATCHING
  if (branch) {
    if (branch.includes("computer") || branch.includes("cs")) {
      query += `
        AND (
          LOWER(course_name) LIKE '%computer%' 
          OR LOWER(course_name) LIKE '%cse%'
          OR LOWER(course_name) LIKE '%information technology%'
          OR LOWER(course_name) LIKE '%it%'
        )
      `;
    } else if (branch.includes("civil")) {
      query += " AND LOWER(course_name) LIKE '%civil%'";
    } else if (branch.includes("mechanical")) {
      query += " AND LOWER(course_name) LIKE '%mechanical%'";
    } else if (branch.includes("electrical")) {
      query += " AND LOWER(course_name) LIKE '%electrical%'";
    } else {
      query += " AND LOWER(course_name) LIKE ?";
      params.push(`%${branch}%`);
    }
  }

  query += " ORDER BY percentile DESC LIMIT 20";

  console.log("📊 SQL:", query);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).send("Database error");
    }

    console.log("✅ Results:", results.length);
    res.json(results);
  });
});

// ===============================
// 🤖 CHATBOT API
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message.toLowerCase();

    let contextData = "";

    // 🎓 College context
    if (userMessage.includes("college")) {
      const [rows] = await db.promise().query(
        "SELECT college_name, course_name, percentile FROM cutoffs LIMIT 5"
      );

      contextData =
        "Colleges:\n" +
        rows
          .map(
            (r) =>
              `${r.college_name} - ${r.course_name} (${r.percentile}%)`
          )
          .join("\n");
    }

    // 🎓 Scholarship context
    else if (userMessage.includes("scholarship")) {
      contextData =
        "Scholarships:\n" +
        scholarships
          .map(
            (s) =>
              `${s.name} (${s.country}) - ${s.amount}`
          )
          .join("\n");
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a career assistant.

${contextData}

User: ${userMessage}

Give short helpful answer.`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    let reply = "No response";

    if (data.candidates?.length) {
      reply = data.candidates[0]?.content?.parts
        ?.map(p => p.text)
        .join(" ");
    }

    res.json({ reply });

  } catch (error) {
    console.error("🔥 CHAT ERROR:", error);
    res.json({ reply: "Server error" });
  }
});

// ===============================
// 🧪 TEST ROUTE
// ===============================
app.get("/check-model", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: "Say hello in one short sentence" }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    let reply = "No response";

    if (data.candidates?.length) {
      reply = data.candidates[0]?.content?.parts
        ?.map(p => p.text)
        .join(" ");
    }

    res.send("✅ Model working: " + reply);

  } catch (err) {
    console.error(err);
    res.send("❌ Model error");
  }
});

// ===============================
// 🌐 DEFAULT ROUTE
// ===============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});