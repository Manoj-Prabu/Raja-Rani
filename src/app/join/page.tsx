'use client';

import React, { useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useGameContext } from '../context/ContextProvider';
import styles from "./JoinRoom.module.css";

function JoinRoom() {
  const { socket } = useSocket();
  const { props }: any = useGameContext();
  const { setInitPage, setMessage } = props;
  const roomIdRef = useRef('');
  const nameRef = useRef('');

  const joinRoom = () => {
    if (roomIdRef.current?.value && nameRef.current?.value)
      socket?.emit('join', { roomId: roomIdRef.current?.value, name: nameRef.current?.value });
    else setMessage(`Provide both room id and name!`);
  };

  return (
    <div className='displayCenter' style={{ height: '100%', flexDirection: 'column' }}>
      <h1>Join Room</h1>
      <div className='displayCenter' style={{ paddingTop: "20px", flexDirection: 'column' }}>
        <label htmlFor="">
          <span style={{ fontSize: '16px' }}>Room ID</span><br />
          <input type="text" className={styles.inputStyle} ref={roomIdRef} placeholder='Room ID' />
        </label>
        <br />
        <label htmlFor="">
          <span style={{ fontSize: '16px' }}>Name</span><br />
          <input type="text" className={styles.inputStyle} ref={nameRef} placeholder='Your name' />
        </label>
        <br />
        <button className={styles.buttonStyle} onClick={joinRoom}>Join</button>
      </div>
      <br />
      <p className={styles.alternateTxt}>Don&#39;t have room to join? <a onClick={() => { setInitPage('create') }}>Create room</a></p>
    </div>
  )
}

export default JoinRoom;