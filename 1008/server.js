import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3000;

console.log("YT_API_KEY loaded:", process.env.YT_API_KEY?.slice(0, 6));

const YT_KEY = process.env.YT_API_KEY; // YouTube Data API Key
const BASE = "https://www.googleapis.com/youtube/v3";

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 랜덤 음악 영상 1개 추천
app.get("/random", async (req, res) => {
  try {
    if (!YT_KEY) {
      return res.status(500).json({ error: "Missing YT_API_KEY env" });
    }

    // 랜덤 검색용 키워드 풀
    const keywords = [
      "music",
      "lofi",
      "kpop",
      "jazz",
      "hiphop",
      "piano",
      "EDM",
      "indie",
    ];

    const orders = ["date", "rating", "relevance", "viewCount"];

    const q = rand(keywords);
    const order = rand(orders);

    const params = new URLSearchParams({
      key: YT_KEY,
      part: "snippet",
      type: "video",
      maxResults: "25",
      q,
      order,
      videoCategoryId: "10", // 음악 카테고리
      videoDuration: "medium",
      safeSearch: "none",
    });

    const r = await fetch(`${BASE}/search?${params}`);

    // API 에러 반환
    if (!r.ok) {
      const detail = await r.text();
      return res.status(500).json({
        error: "youtube_api_error",
        detail,
      });
    }

    const data = await r.json();

    const items = (data.items || []).filter((it) => it.id?.videoId);

    if (items.length === 0) {
      return res.status(404).json({ error: "no_results", q, order });
    }

    const chosen = rand(items);
    const videoId = chosen.id.videoId;

    res.json({
      q,
      order,
      videoId,
      title: chosen.snippet?.title,
      channelTitle: chosen.snippet?.channelTitle,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumb:
        chosen.snippet?.thumbnails?.high?.url ??
        chosen.snippet?.thumbnails?.default?.url,
    });
  } catch (e) {
    res.status(500).json({
      error: "server_error",
      detail: String(e),
    });
  }
});

app.listen(PORT, () =>
  console.log(`http://localhost:${PORT}/random`)
);
