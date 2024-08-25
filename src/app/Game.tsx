'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from './context/SocketContext';
import { ContextProvider } from './context/ContextProvider';
import Snackbar from '@mui/material/Snackbar';

function Game({ children }: any) {
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState('');
  const [message, setMessage] = useState('');
  const [players, setPlayers] = useState([]);
  // const [gameState, setGameState] = useState(/* initial game state */);
  const router = useRouter();
  const [initPage, setInitPage] = useState('');
  const [openToaster, setOpenToaster] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [chats, setChats] = useState([]);
  const [activePlayer, setActivePlayer] = useState({ name: '', char: '' });

  useEffect(() => {
    if (initPage === "create") router.push('/create');
    else if (initPage === "join") router.push('/join');
    // else router.push('/');
  }, [initPage])

  useEffect(() => {
    if (message !== '') setOpenToaster(true);
  }, [message])

  useEffect(() => {
    if (!socket) return;

    socket.on('roomCreated', (data) => {
      setRoomId(data.roomId);
      setPlayerName(data.name);
      setMessage(`Room created with ID: ${data.roomId}`);
      socket.emit('chat', { room: data.roomId, msg: { player: null, message: `${data.name} created the room` } });
      router.push(`/room`);
    });

    socket.on('joined', (data) => {
      setRoomId(data.roomId);
      setPlayerName(data.name);
      setMessage(`Joined room: ${data.roomId} as ${data.name}`);
      socket.emit('chat', { room: data.roomId, msg: { player: null, message: `${data.name} joined the room` } });
      router.push(`/room`);
    });

    // socket.on('move', (data) => {
    //   // Update game state with the new move
    //   // setGameState(prevState => {
    //   //   // Logic to update game state based on the move
    //   //   return '';
    //   // });
    //   setMessage(`${data.name}: ${data.move}`);
    // });

    socket.on('error', (data) => {
      setMessage(`Error: ${data.message}`);
    });

    socket.on('playerList', (playerList) => {
      setPlayers(playerList);
    });

    socket.on('message', (messages) => {
      setChats(messages.chats);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('joined');
      socket.off('move');
      socket.off('error');
      socket.off('playerList');
    };
  }, [socket, router]);

  return <>
    <ContextProvider props={{ initPage, setInitPage, roomId, setRoomId, playerName, players, activePlayer, setActivePlayer, chats, message, setMessage }} >
      {children}
    </ContextProvider>
    <Snackbar
      open={openToaster}
      autoHideDuration={3000}
      onClose={() => { setOpenToaster(false); setMessage(''); }}
      message={message}
      action={<button onClick={() => { setOpenToaster(false); setMessage(''); }} style={{ background: "transparent" }}>&#10006;</button>}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
  </>
}

export default Game