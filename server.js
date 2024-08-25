const { createServer } = require('http');
const next = require('next');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = new Map();
const roomChats = {};
const toFind = { King: "Queen", Queen: "Minister", Minister: "Police", Police: "Thief" };
const validChars = {
  King: ['Queen', 'Minister', 'Police', 'Thief'],
  Queen: ['Minister', 'Police', 'Thief'],
  Minister: ['Police', 'Thief'],
  Police: ['Thief']
};
const points = { King: 4, Queen: 3, Minister: 2, Police: 1, Thief: 0 };

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = socketIo(server);

  const getPlayerList = (roomId) => {
    if (rooms.has(roomId)) {
      return rooms.get(roomId).map(client => ({ name: client.name, isHost: client.isHost, char: client.char, point: client.point }));
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

    socket.on('create', ({ name }) => {
      const roomId = uuidv4();
      rooms.set(roomId, []);
      currentRoom = roomId;
      rooms.get(roomId).push({ socket, name, isHost: true, char: null, point: 0 });
      socket.emit('roomCreated', { roomId, name });
      broadcastPlayerList(roomId);
    });

    socket.on('join', ({ roomId, name }) => {
      currentRoom = roomId;
      if (rooms.has(currentRoom)) {
        const roomInfo = rooms.get(roomId);
        if (roomInfo.length < 5) {
          const nameExist = roomInfo.filter(client => client.name === name);
          if (nameExist.length > 0) socket.emit('error', { message: `Player with name "${name}" already exist!` });
          else {
            rooms.get(currentRoom).push({ socket, name, isHost: false, char: null, point: 0 });
            socket.emit('joined', { roomId: currentRoom, name });
            broadcastPlayerList(roomId);
          }
        } else {
          socket.emit('error', { message: `The room reached the player count limit` });
        }
      } else {
        socket.emit('error', { message: 'Room not found' });
      }
    });

    socket.on('chat', ({ room, msg }) => {
      if (!roomChats[room]) roomChats[room] = [];
      roomChats[room].push(msg);
      rooms.get(room).forEach(client => {
        client.socket.emit('message', { chats: roomChats[room] });
      });
      //need to check io.to(), which is not working
      // io.to(room).emit('message', { chats: roomChats[room] });
    });

    socket.on('assign', ({ room, chars }) => {
      if (!rooms.has(room)) {
        console.error(`Room ${room} does not exist.`);
        return;
      }
      let activePlayer = null;
      const clients = rooms.get(room);
      clients.forEach((client, i) => {
        client.char = chars[client.name];
        client.point = 0;
        if (chars[client.name] === "King") activePlayer = client.name;
      });
      clients.forEach((client, i) => {
        client.socket.emit('assigned', { name: activePlayer, char: 'King' });
      });
      broadcastPlayerList(room);
    });

    socket.on('guess', ({ roomId, activePlayer, selectedPlayer }) => {
      const clients = rooms.get(roomId);
      const client1 = clients.find(c => c.name === activePlayer.name);
      const client2 = clients.find(c => c.name === selectedPlayer.name);
      const info = `${activePlayer.name} (${activePlayer.char}) selected ${selectedPlayer.name} as ${toFind[activePlayer.char]}`;
      if (toFind[activePlayer.char] === selectedPlayer.char) {
        client1.point += points[activePlayer.char];
        if (activePlayer.char === "Police" && selectedPlayer.char === "Thief") {
          clients.forEach(client => {
            client.socket.emit('end', { next: { name: selectedPlayer.name, char: selectedPlayer.char }, result: true, info });
          });
          broadcastPlayerList(roomId);
        } else {
          clients.forEach((client, i) => {
            client.socket.emit('moved', { next: { name: selectedPlayer.name, char: selectedPlayer.char }, result: true, info });
          });
          broadcastPlayerList(roomId);
        }
      } else if (validChars[activePlayer.char].includes(selectedPlayer.char)) {
        client1.char = selectedPlayer.char;
        client2.char = activePlayer.char;
        clients.forEach((client, i) => {
          client.socket.emit('moved', { next: { name: selectedPlayer.name, char: activePlayer.char }, result: false, info });
        });
        broadcastPlayerList(roomId);
      } else {
        client1.point -= 1; clients.forEach((client, i) => {
          client.socket.emit('moved', { next: activePlayer, result: false, info });
        });
        broadcastPlayerList(roomId);
      }
    });

    socket.on('restart', ({ roomId }) => {
      const clients = rooms.get(roomId);
      clients.forEach((client, i) => {
        client.char = null;
        client.point = 0;
        client.socket.emit('start');
      });
      broadcastPlayerList(roomId);
    })

    // socket.on('move', (move) => {
    //   if (currentRoom && rooms.has(currentRoom)) {
    //     rooms.get(currentRoom).forEach(client => {
    //       if (client.socket !== socket) {
    //         client.socket.emit('move', { move, name: client.name });
    //       }
    //     });
    //   }
    // });

    socket.on('disconnect', () => {
      console.log("disconnected");
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
