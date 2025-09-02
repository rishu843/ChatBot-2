require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const upload = multer({ dest: "uploads/" });

// check API key
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// route
app.post("/get", upload.single("file"), async (req, res) => {
  const userInput = req.body.msg || "";
  const uploadedFile = req.file;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = [userInput];

    // if file uploaded, read and add as inlineData
    if (uploadedFile) {
      const fileData = fs.readFileSync(uploadedFile.path);
      const image = {
        inlineData: {
          data: fileData.toString("base64"),
          mimeType: uploadedFile.mimetype,
        },
      };
      prompt.push(image);
    }

    // generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.send(text);
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).send("Error generating response");
  } finally {
    if (uploadedFile) {
      fs.unlinkSync(uploadedFile.path); // cleanup file
    }
  }
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
