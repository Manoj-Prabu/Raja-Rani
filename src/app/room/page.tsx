// app/room/[roomId]/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../context/SocketContext';
import { useGameContext } from '../context/ContextProvider';
import share from '../../assets/images/share.png';
import Image from 'next/image';
import styles from './Room.module.css';
import Modal from '@mui/material/Modal';

export default function Room() {
  const { socket } = useSocket();
  const router = useRouter();
  const { props }: any = useGameContext();
  const { roomId, playerName, players, activePlayer, setActivePlayer, chats, setMessage } = props;
  const [started, setStarted] = useState(false);
  const msgRef = useRef<HTMLInputElement>(null);
  const charIcon = { King: '🤴🏻', Queen: '👸🏻', Minister: '👮🏻', Police: '💂🏻', Thief: '🥷🏻' };
  const [end, setEnd] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [loadMsg, setLoadMsg] = useState({ result: '', info: '' });

  useEffect(() => {
    if (!socket) {
      router.push('/');
      return;
    }

    socket.on('assigned', (data) => {
      setMessage(`Characters assigned to players!`);
      setActivePlayer(data);
      setStarted(true);
    });

    socket.on('moved', ({ next, result, info }) => {
      handleOpen();
      setLoadMsg({ result: result ? '✔️' : '❌', info: info });
      setActivePlayer(next);
      setTimeout(() => {
        handleClose();
      }, 3000);
    });

    socket.on('end', ({ next, result, info }) => {
      handleOpen();
      setEnd(true);
      setLoadMsg({ result: result ? '✔️' : '❌', info: info });
      setActivePlayer(next);
      setTimeout(() => {
        handleClose();
      }, 3000);
    });

    socket.on('start', () => {
      setStarted(false);
      setEnd(false);
    });

    return () => {
      socket.off('move');
      socket.off('assigned');
      socket.off('start');
      socket.off('end');
    };
  }, [socket, router]);

  function shuffleArray(array: string[]) {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  const assignCharFn = (names: { name: string, char: string }[]) => {
    const characters = ['King', 'Queen', 'Minister', 'Police', 'Thief'];
    if (names.length !== characters.length) {
      throw new Error('The number of names and characters must be the same.');
    }

    // Shuffle the characters array
    const shuffledCharacters = shuffleArray(characters);

    // Create an assignment object
    return names.reduce((acc, { name }, index) => {
      acc[name] = shuffledCharacters[index];
      return acc;
    }, {} as Record<string, string>);
  }

  const startAssign = () => {
    const arr = assignCharFn(players);
    socket?.emit('assign', { room: roomId, chars: arr });
  }

  const sendMsg = () => {
    if (msgRef.current !== null && msgRef.current?.value !== '') {
      socket?.emit('chat', { room: roomId, msg: { player: playerName, message: msgRef.current?.value } });
      if (msgRef.current) msgRef.current.value = '';
    } else msgRef.current?.focus();
  }

  const onGuess = (selected: { name: string, char: string }) => {
    socket?.emit('guess', { roomId, activePlayer, selectedPlayer: selected });
  }

  const reStart = () => {
    socket?.emit('restart', { roomId });
  }

  return (<>
    <div style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
        <h2><span>Raja Rani</span> <span>🤴🏻👸🏻👮🏻💂🏻🥷🏻</span></h2>
        <div style={{
          border: '1px solid lightgray',
          padding: '10px',
          borderRadius: '15px'
        }}><span title='Share Room ID' style={{
          cursor: 'pointer',
          padding: '10px 10px 10px 0px',
          borderRight: '1px solid lightgray'
        }} onClick={() => { window.navigator.clipboard.writeText(roomId); setMessage('Copied!'); }}><Image src={share} alt='share' height={12} /></span> {roomId}</div>
      </div>
      {/* <div style={{ display: 'flex', justifyContent: 'end', fontSize: '8px', padding: '10px 10px 30px 10px' }}>
        <div style={{
          border: '1px solid lightgray',
          padding: '10px',
          borderRadius: '15px'
        }}><span title='Share Room ID' style={{
          cursor: 'pointer',
          padding: '10px 10px 10px 0px',
          borderRight: '1px solid lightgray'
        }} onClick={() => { window.navigator.clipboard.writeText(roomId); setMessage('Copied!'); }}><Image src={share} alt='share' height={12} /></span> {roomId}</div>
      </div> */}
      <div style={{ display: 'grid', alignItems: 'center', justifyContent: 'center', gridTemplate: 'auto / .8fr 1fr 1fr' }}>
        <div className={styles.ctrlBtnArea + ' controlArea'}>
          {!started && players.length === 5 && <button style={{ background: "#039BE5" }} onClick={() => { startAssign(); }}>Assign Char</button>}
          {end && <button style={{ background: "#F44336" }} onClick={reStart}>Reset</button>}
          {end && <table className={styles.pointTbl}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player: { name: string, point: number }) => <tr key={player.name}>
                <td>{player.name}</td>
                <td>{player.point}</td>
              </tr>
              )}
            </tbody>
          </table>}
          <div>
            <span style={{ textDecoration: 'underline' }}>Rules</span>
            <ul>
              <li>Once the characters assigned to the players:</li>
              <li>👉🏻 King need to find Queen</li>
              <li>👉🏻 Queen need to find Minister</li>
              <li>👉🏻 Minister need to find Police</li>
              <li>👉🏻 Police need to find Thief</li>
              <li>👉🏻 For example if the King misjudged some other char as Queen, then the character exchange between the players. This is same for all other players</li>
              <li>👉🏻 If a player misjudged, who&#39;s char is already found out, then character exchange won&#39;t happen and also 1 point will be reduced for that player</li>
              <li>👉🏻 The point system was like King = 4, Queen = 3, Minister = 2, Police = 1, Thief = 0</li>
            </ul>
          </div>
        </div>
        <div className={styles.playerContainer + " playerArea"}>
          {!started && <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', textAlign: 'center' }}>Start the game and assign the characters to the playes by clicking <code>Assign char</code> button</div>}
          {started && <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', textAlign: 'center' }}>{activePlayer.name} is the {activePlayer.char}</div>}
          {players.map((player: { name: string, char: string, point: string }, index: number) => <div key={player.name}>
            {playerName === player.name && <span title={`You are the ${player.char}`}>{charIcon[player.char as keyof typeof charIcon]}</span>}
            <button className={styles.btnStyle} onClick={() => { activePlayer.name === playerName && playerName !== player.name && onGuess({ name: player.name, char: player.char }) }}>
              {playerName === player.name && <span title='You' style={{ float: "left" }}>🫵🏻</span>}
              <span className={styles.nameStyle}>{player.name}</span>
              {activePlayer.name === player.name && <span title={player.char} style={{ float: "right" }}>{charIcon[player.char as keyof typeof charIcon]}</span>}
            </button>
            {/* <span>{player.point}</span> */}
          </div>)}
        </div>
        <div className='chatArea' style={{ height: '500px', paddingLeft: '5px' }}>
          <div style={{
            height: '50px',
            background: 'gray',
            textAlign: 'center',
            padding: '15px',
            borderTopRightRadius: '20px',
            borderTopLeftRadius: '20px'
          }}>Chats 🗨️</div>
          <div style={{ height: 'calc(100% - 92px)', padding: '10px', overflow: 'auto' }}>
            {chats.map((msg: { player: string, message: string }, i: number) => <div key={i} style={{ textAlign: (msg.player === playerName) ? 'end' : 'start' }}>
              {msg.player !== null ? <><div style={{ marginLeft: (msg.player === playerName) ? 'auto' : '' }}>{msg.player}</div>
                <div style={{
                  background: '#333333',
                  width: 'fit-content',
                  padding: '10px',
                  borderRadius: '5px',
                  marginTop: '5px',
                  marginBottom: '10px',
                  marginLeft: (msg.player === playerName) ? 'auto' : ''
                }}>{msg.message}</div></>
                : <div className='displayCenter' style={{ padding: '5px 0' }}><div className={styles.chatInfo}>{msg.message}</div></div>}
            </div>)}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly'
          }}>
            <input type="text" style={{
              fontSize: '16px',
              padding: '10px 20px',
              borderRadius: '10px',
              width: '80%'
            }} ref={msgRef} placeholder='Type here...' />
            <span style={{ fontSize: '24px', cursor: "pointer" }} title='Send' onClick={sendMsg}>🚀</span>
          </div>
        </div>
      </div>
    </div>
    <Modal
      open={open}
      // onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        backgroundColor: 'black',
        border: '2px solid #000',
        boxShadow: '24px',
        padding: '4px',
      }}>
        <div>
          <div style={{ fontSize: "50px", textAlign: 'center' }}>{loadMsg.result}</div>
          <div style={{ textAlign: "center" }}>{loadMsg.info}</div>
        </div>
      </div>
    </Modal >
  </>);
}
