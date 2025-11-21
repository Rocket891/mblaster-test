const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Simple homepage
app.get("/", (req, res) => {
  res.send("mblaster-test is running. Go to /test-mblaster");
});

// Test endpoint to call mBlaster /api/send
app.get("/test-mblaster", async (req, res) => {
  try {
    const instanceId = "691AAD3AACBF7";
    const accessToken = "6823295cdd694";
    const number = "917021542840"; // your own number

    const url = "https://mblaster.in/api/send";

    const body = {
      number,
      type: "text",
      message: "Test from Railway",
      instance_id: instanceId,
      access_token: accessToken,
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await r.text();

    const looksLikeHtml =
      text.trim().startsWith("<") &&
      text.toLowerCase().includes("<html");

    if (looksLikeHtml) {
      return res.status(200).json({
        ok: false,
        reason: "HTML_RESPONSE",
        statusCode: r.status,
        bodySample: text.slice(0, 200),
      });
    }

    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // not JSON
    }

    return res.status(200).json({
      ok: true,
      statusCode: r.status,
      parsedJson: json,
      rawSample: json ? undefined : text.slice(0, 200),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      reason: "ERROR_CALLING_MBLASTER",
      error: err.message || String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log("mblaster-test app running on port", PORT);
});
