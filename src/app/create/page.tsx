'use client';

import React, { useRef } from 'react';
import styles from './CreateRoom.module.css';
import { useGameContext } from '../context/ContextProvider';
import { useSocket } from '../context/SocketContext';

function CreateRoom() {
  const { socket } = useSocket();
  const { props }: any = useGameContext();
  const { setInitPage, setMessage } = props;
  
  // Specify the type as HTMLInputElement | null
  const hostNameRef = useRef<HTMLInputElement | null>(null);

  const createRoom = () => {
    const input = hostNameRef.current;
    if (input && input.value) {
      socket?.emit('create', { name: input.value });
    } else {
      setMessage('Error: Please provide name');
    }
  };

  return (
    <div className='displayCenter' style={{ height: '100%', flexDirection: 'column' }}>
      <h1>Create Room</h1>
      <div className='displayCenter' style={{ paddingTop: "20px", flexDirection: 'column' }}>
        <label htmlFor="">
          <span style={{ fontSize: '16px' }}>Name</span><br />
          <input type="text" className={styles.inputStyle} ref={hostNameRef} placeholder='Your name' />
        </label>
        <br />
        <button className={styles.buttonStyle} onClick={createRoom}>Create</button>
      </div>
      <br />
      <p className={styles.alternateTxt}>Already created room? <a onClick={() => { setInitPage('join') }}>Join room</a></p>
    </div>
  );
}

export default CreateRoom;