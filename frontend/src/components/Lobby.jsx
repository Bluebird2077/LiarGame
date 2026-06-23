import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function Lobby({ nickname, setNickname, onRoomCreated, onRoomJoined }) {
  const [joinCode, setJoinCode] = useState('');
  const [isAutoJoining, setIsAutoJoining] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setJoinCode(code);
      setIsAutoJoining(true);
      // Give a slight delay so socket can connect properly before emitting
      setTimeout(() => {
        socket.emit('joinRoom', { roomId: code, nickname }, (response) => {
          setIsAutoJoining(false);
          if (response.success) {
            onRoomJoined(response.roomId, response.players);
          } else {
            alert(response.message);
          }
        });
      }, 500);
    }
  }, [nickname, onRoomJoined]);

  const handleCreateRoom = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!');
    socket.emit('createRoom', { nickname }, (response) => {
      if (response.success) {
        onRoomCreated(response.roomId, response.players);
      }
    });
  };

  const handleJoinRoom = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요!');
    if (!joinCode.trim()) return alert('방 코드를 입력해주세요!');
    
    socket.emit('joinRoom', { roomId: joinCode, nickname }, (response) => {
      if (response.success) {
        onRoomJoined(response.roomId, response.players);
      } else {
        alert(response.message);
      }
    });
  };

  if (isAutoJoining) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center' }}>
        <h2>방에 입장하는 중...</h2>
        <div className="status-message" style={{ marginTop: '20px' }}>
          잠시만 기다려주세요!
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <h1>Liar Game</h1>
      <p className="subtitle">웹에서 즐기는 짜릿한 눈치 게임</p>
      
      <div className="input-group">
        <label>닉네임</label>
        <input 
          type="text" 
          placeholder="당신의 이름을 입력하세요" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={10}
        />
      </div>

      <button onClick={handleCreateRoom} disabled={!nickname.trim()}>
        새로운 방 만들기
      </button>

      <div style={{ textAlign: 'center', margin: '10px 0', color: 'var(--text-muted)' }}>
        ──────── OR ────────
      </div>

      <div className="input-group">
        <label>방 코드</label>
        <input 
          type="text" 
          placeholder="참여할 방 코드 4자리" 
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          maxLength={4}
        />
      </div>

      <button className="secondary" onClick={handleJoinRoom} disabled={!nickname.trim() || !joinCode.trim()}>
        방 입장하기
      </button>
    </div>
  );
}

export default Lobby;
