'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(/* initial game state */);

  useEffect(() => {
    const socket = io();
    socket.on('roomCreated', (data) => {
      setMessage(`Room created with ID: ${data.roomId}`);
    });
    socket.on('joined', (data) => {
      setMessage(`Joined room: ${data.roomId} as ${data.name}`);
    });
    socket.on('move', (data) => {
      // Update game state with the new move
      setGameState(prevState => {
        // Logic to update game state based on the move
        return updatedState;
      });
      setMessage(`${data.name}: ${data.move}`);
    });
    socket.on('error', (data) => {
      setMessage(`Error: ${data.message}`);
    });
    socket.on('playerList', (playerList) => {
      setPlayers(playerList);
    });
    setSocket(socket);
    return () => socket.disconnect();
  }, []);

  const createRoom = () => {
    socket.emit('create');
  };

  const joinRoom = () => {
    socket.emit('join', { roomId, name });
  };

  const sendMove = (move) => {
    socket.emit('move', move);
  };

  // Example function to handle player move (e.g., in a chess game)
  const handlePlayerMove = (move) => {
    // Validate and process the move locally
    // Update the game state locally
    sendMove(move); // Send the move to the server
  };

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
      <button onClick={joinRoom}>Join Room</button>
      <div id="game" onClick={() => handlePlayerMove('example move')}>Click to send move</div>
      <div id="message">{message}</div>
      <div id="players">
        <h2>Players in Room:</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
      <div>
        <div>
          <button>Create Room</button>
          <span>or</span>
          <button>Join Room</button>
          </div>
      </div>
      {/* Render game state here */}
    </div>
  );
}
