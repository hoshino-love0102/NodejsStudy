const http = require("http");
const { URL } = require("url");
const dotenv = require("dotenv");

dotenv.config();

const TOKEN = process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error("env에 토큰없음 이슈");
  process.exit(1);
}

async function fetchContributionCalendar(username, year) {
  const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
  const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();

  const query = `
    query ($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "nodejs-grass-study",
    },
    body: JSON.stringify({
      query,
      variables: { login: username, from, to },
    }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.map((e) => e.message).join(" | ") || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  if (!json.data?.user) throw new Error("유저를 찾을 수 없음 (username 확인)");

  const cal = json.data.user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);

  return { username, year, total: cal.totalContributions, days };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (url.pathname === "/grass") {
      const username = url.searchParams.get("u");
      const yearStr = url.searchParams.get("year") || String(new Date().getUTCFullYear());
      const year = Number(yearStr);

      if (!username) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "query param u 필요. 예: /grass?u=octocat" }));
      }
      if (!Number.isInteger(year) || year < 2008 || year > 2100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "year가 이상함. 예: /grass?u=octocat&year=2025" }));
      }

      const data = await fetchContributionCalendar(username, year);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(3000, () => {
  console.log("http://localhost:3000");
  console.log("예: /grass?u=octocat&year=2025");
});
