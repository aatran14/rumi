const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const PORT = process.env.PORT || 3000;

// --- In-memory shared state ---
const state = {
  tasks: [
    { id: '1', title: 'Wipe Counters', assignee: 'Bob', due: '2 days', done: false },
    { id: '2', title: 'Take out trash', assignee: 'Bob', due: '2 days', done: false },
    { id: '3', title: 'Vacuum living room', assignee: 'Bob', due: '2 days', done: false },
    { id: '4', title: 'Eat more ranch', assignee: 'Bobbita', due: 'today!', done: true },
  ],
  roommates: [
    { id: '1', name: 'Daniel', status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F512} Locked in!!!', bubbleColor: '#FF6B6B', timestamp: '4/3 2:39pm' },
    { id: '2', name: 'Gaya', status: 'Away', statusEmoji: '\u{1F44B}', bubble: '\u{1F92F} Bored af', bubbleColor: '#4ECDC4', timestamp: '4/3 1:40pm' },
    { id: '3', name: 'Adriel', status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F512} Locked in!!!', bubbleColor: '#FFA726' },
    { id: '4', name: 'Andy', status: 'Home', statusEmoji: '\u{1F3E0}', bubble: '\u{1F480} leave me alone', bubbleColor: '#A29BFE' },
  ],
  events: [
    {
      id: '1',
      title: 'Soju Night',
      allDay: false,
      startDate: 'Wed, April 2, 2026',
      startTime: '1:30 PM',
      endDate: 'Wed, April 2, 2026',
      endTime: '3:30 PM',
      repeats: false,
      notes: 'Person A, B, C are coming over to our apartment we getting crunked tonight.',
      createdBy: 'Billy Bob Joe',
    },
  ],
};

// --- Express app ---
const app = express();
const server = http.createServer(app);

// Serve the Expo web build
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- WebSocket server ---
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

function broadcast(msg, exclude) {
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client !== exclude && client.readyState === 1) {
      client.send(data);
    }
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected (${clients.size} total)`);

  // Send current state immediately
  ws.send(JSON.stringify({ type: 'sync', state }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      switch (msg.type) {
        case 'request_sync':
          ws.send(JSON.stringify({ type: 'sync', state }));
          break;
        case 'update_tasks':
          state.tasks = msg.tasks;
          broadcast(msg, ws);
          break;
        case 'update_roommates':
          state.roommates = msg.roommates;
          broadcast(msg, ws);
          break;
        case 'update_events':
          state.events = msg.events;
          broadcast(msg, ws);
          break;
      }
    } catch (err) {
      console.error('Bad message:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected (${clients.size} total)`);
  });
});

server.listen(PORT, () => {
  console.log(`Rumi server running on http://localhost:${PORT}`);
  console.log(`WebSocket at ws://localhost:${PORT}/ws`);
  console.log(`\nTo share with roommates, run:`);
  console.log(`  ngrok http ${PORT}`);
});
