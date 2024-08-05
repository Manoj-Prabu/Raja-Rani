const { createServer } = require('http');
const next = require('next');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = socketIo(server);

  const getPlayerList = (roomId) => {
    if (rooms.has(roomId)) {
      return rooms.get(roomId).map(client => client.name);
    }
    return [];
  };

  const broadcastPlayerList = (roomId) => {
    const players = getPlayerList(roomId);
    rooms.get(roomId).forEach(client => {
      client.socket.emit('playerList', players);
    });
  };

  io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('create', () => {
      const roomId = uuidv4();
      rooms.set(roomId, []);
      currentRoom = roomId;
      rooms.get(roomId).push({ socket, name: 'Host' });
      socket.emit('roomCreated', { roomId });
      broadcastPlayerList(roomId);
    });

    socket.on('join', ({ roomId, name }) => {
      currentRoom = roomId;
      if (rooms.has(currentRoom)) {
        rooms.get(currentRoom).push({ socket, name });
        socket.emit('joined', { roomId: currentRoom, name });
        broadcastPlayerList(roomId);
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
    });

    socket.on('move', (move) => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.get(currentRoom).forEach(client => {
          if (client.socket !== socket) {
            client.socket.emit('move', { move, name: client.name });
          }
        });
      }
    });

    socket.on('disconnect', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        rooms.set(currentRoom, rooms.get(currentRoom).filter(client => client.socket !== socket));
        broadcastPlayerList(currentRoom);
      }
    });
  });

  server.listen(3000, () => {
    console.log('> Server listening on http://localhost:3000');
  });
});
