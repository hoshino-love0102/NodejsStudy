import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

const YT_KEY = process.env.YT_API_KEY;
const BASE = "https://www.googleapis.com/youtube/v3";

if (!YT_KEY) {
  console.error("Missing YT_API_KEY in env");
  process.exit(1);
}

app.use(express.static(__dirname));

const ALLOWED_REGIONS = new Set(["KR", "US", "JP"]);

app.get("/api/trending", async (req, res) => {
  try {
    const regionCode = String(req.query.regionCode || "KR").toUpperCase();
    if (!ALLOWED_REGIONS.has(regionCode)) {
      return res.status(400).json({
        error: "invalid_regionCode",
        allowed: Array.from(ALLOWED_REGIONS),
      });
    }

    const maxResults = String(Math.min(Number(req.query.maxResults || 12), 50));

    const params = new URLSearchParams({
      key: YT_KEY,
      part: "snippet,statistics",
      chart: "mostPopular",
      regionCode,
      videoCategoryId: "10",
      maxResults,
    });

    const r = await fetch(`${BASE}/videos?${params}`);
    if (!r.ok) {
      const detail = await r.text();
      return res.status(500).json({ error: "youtube_api_error", detail });
    }

    const data = await r.json();

    const items = (data.items || []).map((v) => ({
      videoId: v.id,
      title: v.snippet?.title,
      channelTitle: v.snippet?.channelTitle,
      publishedAt: v.snippet?.publishedAt,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumb:
        v.snippet?.thumbnails?.high?.url ??
        v.snippet?.thumbnails?.medium?.url ??
        v.snippet?.thumbnails?.default?.url,
      viewCount: Number(v.statistics?.viewCount || 0),
      likeCount: Number(v.statistics?.likeCount || 0),
    }));

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ regionCode, items }, null, 2));
  } catch (e) {
    res.status(500).json({ error: "server_error", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
