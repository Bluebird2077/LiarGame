import React, { useState } from 'react';
import { socket } from '../socket';
import { QRCodeSVG } from 'qrcode.react';

function WaitingRoom({ roomId, players, isHost, myId, onLeave }) {
  const [category, setCategory] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const handleStartGame = () => {
    if (!category.trim()) {
      return alert('카테고리를 입력해주세요!');
    }
    if (players.length < 2) {
      return alert('최소 2명의 플레이어가 필요합니다.');
    }

    setIsRequesting(true);
    socket.emit('startGame', { roomId, category });
    
    // We don't reset isRequesting here, it will unmount or error will reset it if we listen to errors (managed in App currently, but for UX we can just let it spin until game starts)
  };

  const joinUrl = `${window.location.origin}/?code=${roomId}`;

  return (
    <div className="glass-panel">
      <h2>대기실</h2>
      <p className="subtitle">참여 코드: <strong>{roomId}</strong></p>
      
      <div className="qr-container">
        <QRCodeSVG value={joinUrl} size={120} />
        <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
          카메라로 스캔하여 입장
        </span>
      </div>

      <div className="player-list">
        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--text-muted)' }}>
          접속 중인 플레이어 ({players.length}명)
        </h3>
        {players.map(p => (
          <div key={p.id} className="player-item">
            <span>
              {p.nickname} {p.id === myId && <span style={{ color: 'var(--text-muted)' }}>(나)</span>}
            </span>
            {p.isHost && <span className="badge">방장</span>}
          </div>
        ))}
      </div>

      {isHost ? (
        <div className="input-group" style={{ marginTop: '10px' }}>
          <label>게임 주제 (카테고리)</label>
          <input 
            type="text" 
            placeholder="예: 과일, 직업, 동물 등" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isRequesting}
          />
          <button onClick={handleStartGame} disabled={isRequesting || players.length < 2} style={{ marginTop: '10px' }}>
            {isRequesting ? 'AI 키워드 생성 중...' : '게임 시작'}
          </button>
        </div>
      ) : (
        <div className="status-message" style={{ marginTop: '10px' }}>
          방장이 주제를 고르고 게임을 시작할 때까지 대기해주세요...
        </div>
      )}

      <button className="danger" onClick={onLeave} style={{ marginTop: '10px' }}>
        로비로 나가기
      </button>
    </div>
  );
}

export default WaitingRoom;
