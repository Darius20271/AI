const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 8080; // Use environment variable or default port
const host = '0.0.0.0';

const genAI = new GoogleGenerativeAI("AIzaSyBC1lMo2Vd7FSyr67WKlSFtTEyYYPVHhRE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFileName = new Date().toISOString().replace(/:/g, "-").split(".")[0] + ".txt";
const logFilePath = path.join(logsDir, logFileName);

fs.writeFileSync(logFilePath, `Conversation Log: ${new Date().toLocaleString()}\n\n`, { flag: "w" });

let logs = [];

// Route: Home Page
app.get("/", (req, res) => {
  res.render("index", { logs, error: null });
});

// Route: Handle Prompt Submission
app.post("/generate", async (req, res) => {
  const prompt = req.body.prompt;

  if (prompt.trim() === "") {
    res.render("index", { logs, error: "Please enter a valid prompt." });
    return;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    logs.push({ prompt, response });

    fs.appendFileSync(logFilePath, `Question: ${prompt}\nResponse: ${response}\n\n`);

    res.render("index", { logs, error: null });
  } catch (error) {
    console.error(error);
    res.render("index", { logs, error: "An error occurred while generating the response." });
  }
});

app.listen(port, host, () => {
    console.log(`App running at http://${host}:${port}`);
});