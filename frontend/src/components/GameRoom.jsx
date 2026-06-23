import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function GameRoom({ roomId, isHost, keyword, onLeave }) {
  const [gameStatus, setGameStatus] = useState('게임 시작! 대화를 나눈 후 라이어를 찾아보세요.');

  useEffect(() => {
    socket.on('gameStatusUpdate', (msg) => {
      setGameStatus(msg);
    });

    return () => {
      socket.off('gameStatusUpdate');
    };
  }, []);

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
        {gameStatus}
      </div>

      <button className="danger" onClick={onLeave}>
        로비로 나가기
      </button>
    </div>
  );
}

export default GameRoom;
