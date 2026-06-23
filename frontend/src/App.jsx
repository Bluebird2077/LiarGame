import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import GameRoom from './components/GameRoom';

function App() {
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WAITING, GAME
  const [roomId, setRoomId] = useState('');
  const [nickname, setNickname] = useState('Player_' + Math.floor(Math.random() * 1000));
  const [players, setPlayers] = useState([]);
  const [myId, setMyId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    socket.connect();
    
    socket.on('connect', () => {
      setMyId(socket.id);
    });

    socket.on('playerListUpdate', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('errorMsg', (msg) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    });

    socket.on('gameStarted', () => {
      setGameState('GAME');
    });

    return () => {
      socket.disconnect();
      socket.off('connect');
      socket.off('playerListUpdate');
      socket.off('errorMsg');
      socket.off('gameStarted');
    };
  }, []);

  const handleRoomCreated = (id, initialPlayers) => {
    setRoomId(id);
    setPlayers(initialPlayers);
    setGameState('WAITING');
  };

  const handleRoomJoined = (id, currentPlayers) => {
    setRoomId(id);
    setPlayers(currentPlayers);
    setGameState('WAITING');
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { roomId });
    setGameState('LOBBY');
    setRoomId('');
    setPlayers([]);
  };

  const isHost = players.find(p => p.id === myId)?.isHost || false;

  return (
    <>
      {errorMsg && <div className="error-message" style={{ position: 'fixed', top: 20, zIndex: 100 }}>{errorMsg}</div>}
      
      {gameState === 'LOBBY' && (
        <Lobby 
          nickname={nickname}
          setNickname={setNickname}
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      )}

      {gameState === 'WAITING' && (
        <WaitingRoom 
          roomId={roomId}
          players={players}
          isHost={isHost}
          myId={myId}
          onLeave={handleLeaveRoom}
        />
      )}

      {gameState === 'GAME' && (
        <GameRoom 
          roomId={roomId}
          isHost={isHost}
          onLeave={handleLeaveRoom}
        />
      )}
    </>
  );
}

export default App;
