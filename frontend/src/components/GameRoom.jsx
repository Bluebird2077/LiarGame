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
      
      <p className="subtitle" style={{ color: '#fbbf24' }}>
        주제에 맞게 자유롭게 대화하며 라이어를 색출하세요.
      </p>

      <div className="keyword-box">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>나의 키워드</p>
        <div className="keyword-text">{keyword}</div>
      </div>

      <div className="status-message" style={{ margin: '20px 0' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>이번 라운드 주제</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>{category || '카테고리'}</div>
      </div>

      <div className="status-message" style={{ margin: '20px 0', background: 'rgba(255,255,255,0.05)' }}>
        {gameStatus}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
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
