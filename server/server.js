const app = require('express')();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, { cors: { origin: '*', methods: ['GET','POST'] } });
const PORT = process.env.PORT || 3001;
const players = new Map();

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);
  socket.on('player:move', (data) => {
    players.set(data.id, { ...data, lastSeen: Date.now(), socketId: socket.id });
    const otherPlayers = Array.from(players.values()).filter(p => p.id !== data.id);
    socket.broadcast.emit('players:update', otherPlayers);
  });
  socket.on('disconnect', () => {
    for (const [id, p] of players.entries()) {
      if (p.socketId === socket.id) {
        players.delete(id);
        console.log('Disconnected:', id);
        break;
      }
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, p] of players.entries()) {
    if (now - p.lastSeen > 10000) players.delete(id);
  }
}, 5000);

app.get('/', (req, res) => res.json({ status: 'ok', players: players.size }));
http.listen(PORT, () => console.log('Server on port', PORT));
