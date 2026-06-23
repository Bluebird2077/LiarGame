import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function GameRoom({ roomId, isHost, keyword, category, onLeave }) {
  const [gameStatus, setGameStatus] = useState('게임 시작! 대화를 나눈 후 라이어를 찾아보세요.');

  useEffect(() => {
    socket.on('gameStatusUpdate', (msg) => {
      setGameStatus(msg);
    });

    return () => {
      socket.off('gameStatusUpdate');
    };
  }, []);

  const handleEndGame = () => {
    socket.emit('endGame', { roomId });
  };

  return (
    <div className="glass-panel">
      <h2>게임 진행 중</h2>
      
      <p className="subtitle" style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        주제: {category || '카테고리 없음'}
      </p>

      <div className="keyword-box">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>나의 키워드</p>
        <div className="keyword-text">{keyword}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
        {isHost && (
          <button
            onClick={handleEndGame}
            style={{ width: '100%', background: '#4f46e5', color: '#fff', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            게임 종료 (다같이 대기실로)
          </button>
        )}
        <button
          onClick={onLeave}
          style={{ width: '100%', background: '#334155', color: '#fff', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
        >
          방 나가기
        </button>
      </div>
    </div>
  );
}

export default GameRoom;
