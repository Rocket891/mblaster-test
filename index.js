const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Simple homepage
app.get("/", (req, res) => {
  res.send("mblaster-test is running. Go to /test-mblaster");
});

// Test endpoint to call mBlaster
app.get("/test-mblaster", async (req, res) => {
  try {
    // Your TEMP instance and token
    const instanceId = "691AAD3AACBF7";
    const accessToken = "6823295cdd694";

    const url = `https://mblaster.in/api/get_qrcode?instance_id=${encodeURIComponent(
      instanceId
    )}&access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, { method: "POST" });
    const text = await response.text();

    const looksLikeHtml =
      text.trim().startsWith("<") &&
      text.toLowerCase().includes("<html");

    if (looksLikeHtml || text.includes("IP_REJECTED_HTML")) {
      return res.status(200).json({
        ok: false,
        reason: "LIKELY_BLOCKED",
        bodySample: text.slice(0, 200)
      });
    }

    // Try to parse JSON if possible
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // not JSON, ignore
    }

    return res.status(200).json({
      ok: true,
      parsedJson: json,
      rawSample: json ? undefined : text.slice(0, 200)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      reason: "ERROR_CALLING_MBLASTER",
      error: err.message || String(err)
    });
  }
});

app.listen(PORT, () => {
  console.log("mblaster-test app running on port", PORT);
});
