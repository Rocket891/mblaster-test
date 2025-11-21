const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies for all routes
app.use(express.json());

// Simple homepage
app.get("/", (req, res) => {
  res.send("mblaster-test is running. Use /test-mblaster (send) or POST /webhook-test (receive).");
});

//
// 1) OUTBOUND TEST → /api/send
//
app.get("/test-mblaster", async (req, res) => {
  try {
    // Your TEMP instance and token
    const instanceId = "691AAD3AACBF7";
    const accessToken = "6823295cdd694";
    const number = "917021542840"; // your own WhatsApp number (no +)

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
      // HTML instead of JSON – suspicious
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
    console.error("ERROR in /test-mblaster:", err);
    return res.status(500).json({
      ok: false,
      reason: "ERROR_CALLING_MBLASTER",
      error: err.message || String(err),
    });
  }
});

//
// 2) INBOUND WEBHOOK TEST → mBlaster will POST here
//
app.post("/webhook-test", (req, res) => {
  console.log("===== WEBHOOK RECEIVED AT /webhook-test =====");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("=============================================");

  // Always respond quickly so mBlaster thinks it's OK
  res.json({ ok: true });
});

// Optional: simple GET to check webhook route is alive
app.get("/webhook-test", (req, res) => {
  res.send("Webhook endpoint is up. This should be POSTed to by mBlaster.");
});

app.listen(PORT, () => {
  console.log("mblaster-test app running on port", PORT);
});
