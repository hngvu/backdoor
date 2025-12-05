import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.raw({ type: "*/*"}));

app.all("*", async (req, res) => {
  // Use req.url to preserve query strings and avoid double-decoding issues
  let fullUrl = req.url.slice(1); // Remove leading "/"
  
  // Only decode if the URL appears to be encoded
  if (fullUrl.includes('%')) {
    fullUrl = decodeURIComponent(fullUrl);
  }
  
  // Auto-add https:// if not present
  if (!/^https?:\/\//.test(fullUrl)) {
    fullUrl = 'https://' + fullUrl;
  }
  
  // Validate that we have a proper domain
  if (!/^https?:\/\/.+\..+/.test(fullUrl)) {
    return res.status(400).json({
      error: "Invalid target URL",
      hint: "Use format: https://backdoor.vercel.app/www.example.com/path",
      received: fullUrl
    });
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Internal-Token");
    return res.status(200).end();
  }

  const headers = { ...req.headers };
  delete headers.host;
  delete headers["content-length"];
  delete headers["accept-encoding"]; // Prevent compression issues

  try {
    const upstreamResponse = await fetch(fullUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    });

    // Copy headers but skip compression-related ones
    upstreamResponse.headers.forEach((v, k) => {
      if (!['content-encoding', 'transfer-encoding'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(upstreamResponse.status);

    if (upstreamResponse.body) upstreamResponse.body.pipe(res);
    else res.end();
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚪 Backdoor proxy running on port ${PORT}`));

export default app;