const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();

const server = http.createServer(app);
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  console.log('GET /');
  res.sendFile(path.join(__dirname, 'index.html'));
});

const wss = new WebSocketServer({ server });

function broadcast(json) {
  const data = JSON.stringify(json);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch (e) {
      console.warn('JSON parse error:', raw.toString());
      return;
    }

    if (msg.type === 'chat') {
      broadcast({
        type: 'chat',
        nickname: msg.nickname || '익명',
        message: msg.message,
        timestamp: Date.now(),
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
