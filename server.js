import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.raw({ type: "*/*"}));

app.all("*", async (req, res) => {
  const internalToken = process.env.INTERNAL_PROXY_KEY;
  const clientToken = req.headers["x-internal-token"];
  if (!internalToken || clientToken !== internalToken) {
    return res.status(403).json({ error: "Forbidden: invalid or missing X-Internal-Token" });
  }

  const fullUrl = decodeURIComponent(req.path.slice(1));
  if (!/^https?:\/\//.test(fullUrl)) {
    return res.status(400).json({
      error: "Invalid target URL",
      hint: "Use format: https://backdoor.vercel.app/https://api.example.com/path",
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

  try {
    const upstreamResponse = await fetch(fullUrl, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    });

    upstreamResponse.headers.forEach((v, k) => res.setHeader(k, v));
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