'use client';

// import React, { useState, useEffect } from "react";
// import { useRouter } from 'next/navigation';
// import { useSocket } from './context/SocketContext';
import styles from "./page.module.css";
import { useGameContext } from "./context/ContextProvider";
import { useEffect } from "react";

export default function Home() {
  const { props }: any = useGameContext();
  const { setInitPage } = props;

  useEffect(() => {
    setInitPage('');
  }, [])

  return <>
    <div className="displayCenter" style={{ height: '100%', flexDirection: 'column' }}>
      <div className="moveUpAnimate">
        <h1>Raja Rani</h1>
        <div className="fontAnimate">🤴🏻👸🏻👮🏻💂🏻🥷🏻</div>
      </div>
      <div className="moveUpAnimate">
        <button className={styles.buttonStyle} style={{ backgroundColor: "#0000ba" }}
          onClick={() => { setInitPage('create') }}>Create Room</button>
        <span>  or  </span>
        <button className={styles.buttonStyle} style={{ backgroundColor: "#00ba00" }}
          onClick={() => { setInitPage('join') }}>Join Room</button>
      </div>
    </div>
  </>
  // const { socket } = useSocket();
  // const [message, setMessage] = useState('');
  // const [players, setPlayers] = useState([]);
  // const [roomId, setRoomId] = useState('');
  // const [name, setName] = useState('');
  // const [gameState, setGameState] = useState(/* initial game state */);
  // const router = useRouter();

  // useEffect(() => {
  //   if (!socket) return;

  //   socket.on('roomCreated', (data) => {
  //     // setSoktData({ type: "created", data });
  //     setMessage(`Room created with ID: ${data.roomId}`);
  //   });

  //   socket.on('joined', (data) => {
  //     // setSoktData({ type: "joined", data });
  //     setMessage(`Joined room: ${data.roomId} as ${data.name}`);
  //     router.push(`/room`);
  //   });

  //   socket.on('move', (data) => {
  //     // setSoktData({ type: "moved", data });
  //     // Update game state with the new move
  //     // setGameState(prevState => {
  //     //   // Logic to update game state based on the move
  //     //   return '';
  //     // });
  //     setMessage(`${data.name}: ${data.move}`);
  //   });

  //   socket.on('error', (data) => {
  //     // setSoktData({ "error": data });
  //     setMessage(`Error: ${data.message}`);
  //   });

  //   socket.on('playerList', (playerList) => {
  //     setPlayers(playerList);
  //   });

  //   return () => {
  //     socket.off('roomCreated');
  //     socket.off('joined');
  //     socket.off('move');
  //     socket.off('error');
  //     socket.off('playerList');
  //   };
  // }, [socket, router]);

  // const createRoom = () => {
  //   if (name)
  //     socket.emit('create', { name });
  //   else setMessage('Error: Please provide name');
  // };

  // const joinRoom = () => {
  //   socket.emit('join', { roomId, name });
  // };

  // const sendMove = (move: string) => {
  //   socket.emit('move', move);
  // };

  // const handlePlayerMove = (move: string) => {
  //   sendMove(move);
  // };

  // return <div style={{ height: "100%" }}>
  //   <div style={{
  //     height: '100%',
  //     display: 'flex',
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     flexDirection: 'column',
  //     gap: '10px'
  //   }}>
  //     <div style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       gap: "10px"
  //     }}>
  //       <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
  //       <button onClick={createRoom}>Create Room</button>
  //       <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Room ID" />
  //       <button onClick={joinRoom}>Join Room</button>
  //     </div>
  //     <div id="message">{message}</div>
  //     <div id="players">
  //       <h2>Players in Room:</h2>
  //       <ul>
  //         {players.map((player: string, index: number) => (
  //           <li key={index}>{player}</li>
  //         ))}
  //       </ul>
  //     </div>
  //     <button onClick={() => { handlePlayerMove("shuffle") }}>Move</button>
  //   </div>
  // </div>;
}
