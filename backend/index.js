const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const AI_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyrVpQlVT-Wqecaqju_uUTrQqR8tCJXPY_suVEP1dhiPEoxjRm-EuT1qsiXRmE0P4lGNQ/exec';

// Room state storage
// {
//   roomId: {
//     id: string,
//     hostId: string,
//     players: [{ id: string, nickname: string, isHost: boolean, keyword: string, isLiar: boolean }],
//     isGameStarted: boolean
//   }
// }
const rooms = {};

// Helper to generate a 4-digit room code
function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new room
  socket.on('createRoom', ({ nickname }, callback) => {
    const roomId = generateRoomCode();
    rooms[roomId] = {
      id: roomId,
      hostId: socket.id,
      players: [{ id: socket.id, nickname, isHost: true, keyword: '', isLiar: false }],
      isGameStarted: false
    };

    socket.join(roomId);
    console.log(`${nickname} created room ${roomId}`);
    
    // Return room info to creator
    callback({ success: true, roomId, players: rooms[roomId].players });
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId, nickname }, callback) => {
    const room = rooms[roomId];
    if (!room) {
      return callback({ success: false, message: '방을 찾을 수 없습니다.' });
    }
    if (room.isGameStarted) {
      return callback({ success: false, message: '이미 게임이 진행 중인 방입니다.' });
    }

    // Check if player already exists (rejoin edge case)
    const existingPlayer = room.players.find(p => p.id === socket.id);
    if (!existingPlayer) {
      room.players.push({ id: socket.id, nickname, isHost: false, keyword: '', isLiar: false });
    }

    socket.join(roomId);
    console.log(`${nickname} joined room ${roomId}`);
    
    // Notify others in room
    io.to(roomId).emit('playerListUpdate', room.players);
    
    callback({ success: true, roomId, players: room.players });
  });

  // Host starts the game
  socket.on('startGame', async ({ roomId, category }) => {
    const room = rooms[roomId];
    if (!room) return;
    
    if (socket.id !== room.hostId) {
      socket.emit('errorMsg', '방장만 게임을 시작할 수 있습니다.');
      return;
    }

    if (room.players.length < 2) {
      socket.emit('errorMsg', '최소 2명의 플레이어가 필요합니다.');
      return;
    }

    // Notify clients that AI is thinking
    io.to(roomId).emit('gameStatusUpdate', 'AI가 주제를 생각 중입니다...');

    try {
      console.log(`Requesting keywords for category: ${category}`);
      
      const prompt = `
당신은 창의적이면서도 논리적인 '게임 콘텐츠 설계자'입니다. 
입력된 카테고리 '${category}'에 대해 다음의 6단계 사고 과정을 거쳐 **데이터 정합성**이 완벽한 제시어를 도출하세요.

[1단계: 개체 정의 및 타입 확정]
- 카테고리: '${category}'
- **핵심 속성(Core Identity)**: 이 카테고리의 실제 개체 타입과 **국적/출처**를 명확히 정의하세요.
- **절대 금지 타입(Negative Types)**: 주제와 밀접하지만 타입이 다른 것 (영화라면 감독, 배우, 배역 이름은 절대 금지)

[2단계: 클리셰 블랙리스트(Top 5) 작성]
- 해당 카테고리에서 누구나 1초 만에 떠올릴 법한 가장 유명한 단어 5개를 선정하여 이번 라운드에서 제외합니다.

[3단계: 예비 후보군 20개 생성]
- [1단계]의 핵심 속성과 [2단계]의 블랙리스트를 준수하며 20개의 단어를 생성하세요.
- 반드시 '${category}'의 정의에 100% 부합하는 것만 포함합니다.

[4단계: 데이터 무결성 검사 (Self-Audit)]
- 생성된 20개의 후보 각각에 대해 다음 질문을 던지고, **하나라도 '아니오'가 나오면 즉시 삭제**하세요.
  1. **[국적/범주 검증]**: 이 단어의 제작국이나 출처가 '${category}'에서 요구한 것과 일치하는가?
  2. **[타입 검증]**: 이 단어가 [1단계]에서 정의한 '개체 타입'과 100% 일치하는가?
  3. **[블랙리스트 검증]**: [2단계]의 금지어 혹은 누구나 아는 너무 뻔한 단어인가?

[5단계: 한글화 원칙]
- 모든 제시어는 반드시 '한국어(한글)' 표기를 원칙으로 합니다. (외래어는 통용되는 한글 표기법 준수)

[6단계: 최종 무작위 추출]
- 필터를 통과한 후보 중 두 개를 선택하여 JSON으로 반환하세요.

[출력 형식]
- 어떤 설명도 하지 말고 오직 JSON 데이터만 출력하세요.
{
  "identified_type": "확정된 개체 타입 및 국적",
  "cliche_blacklist": ["금지된 단어1", "금지된 단어2"],
  "normal": "시민 단어",
  "liar": "라이어 단어"
}
`;

      // Make request to GAS
      const response = await axios.post(
        AI_WEB_APP_URL, 
        new URLSearchParams({ prompt: prompt }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      let dataStr = response.data;
      if (typeof dataStr === 'object') {
        dataStr = JSON.stringify(dataStr);
      }
      
      // Clean up markdown wrapping if present
      const cleanJsonStr = dataStr.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Extract json object logic similar to unity
      const startIndex = cleanJsonStr.indexOf('{');
      const endIndex = cleanJsonStr.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1) throw new Error("JSON not found in response");
      
      const jsonStr = cleanJsonStr.substring(startIndex, endIndex + 1);
      
      // Replace single quotes with double quotes roughly (to mimic python dict fix)
      let fixedJsonStr = jsonStr.replace(/'([^']+)'\s*:\s*'([^']*)'/g, '"$1": "$2"');
      fixedJsonStr = fixedJsonStr.replace(/'(\w+)'/g, '"$1"');

      const keywords = JSON.parse(fixedJsonStr);
      
      if (!keywords.normal || !keywords.liar) {
        throw new Error("Invalid keyword format");
      }

      console.log(`Keywords received - Normal: ${keywords.normal}, Liar: ${keywords.liar}`);

      // Pick a liar
      const numPlayers = room.players.length;
      const liarIndex = Math.floor(Math.random() * numPlayers);
      
      room.players.forEach((p, idx) => {
        p.isLiar = (idx === liarIndex);
        p.keyword = p.isLiar ? keywords.liar : keywords.normal;
      });

      room.isGameStarted = true;

      // Broadcast game start
      io.to(roomId).emit('gameStarted');

      // Send individual keywords to players
      room.players.forEach(p => {
        io.to(p.id).emit('yourKeyword', {
          keyword: p.keyword,
          isLiar: p.isLiar // Sending this just in case frontend needs it (though normally it's hidden)
        });
      });

    } catch (err) {
      console.error("AI Request Failed:", err);
      io.to(roomId).emit('gameStatusUpdate', 'AI 키워드 생성에 실패했습니다. 다시 시도해주세요.');
      io.to(roomId).emit('errorMsg', 'AI 연결 오류가 발생했습니다.');
    }
  });

  // Leave room logic
  socket.on('leaveRoom', ({ roomId }) => {
    handleDisconnect(socket.id, roomId);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handleDisconnect(socket.id);
  });

  function handleDisconnect(socketId, specificRoomId = null) {
    const roomIds = specificRoomId ? [specificRoomId] : Object.keys(rooms);
    
    roomIds.forEach(roomId => {
      const room = rooms[roomId];
      if (room) {
        const playerIndex = room.players.findIndex(p => p.id === socketId);
        if (playerIndex !== -1) {
          const isHost = room.players[playerIndex].isHost;
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            // Delete room if empty
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted (empty)`);
          } else {
            if (isHost) {
              // Reassign host
              room.players[0].isHost = true;
              room.hostId = room.players[0].id;
              io.to(roomId).emit('gameStatusUpdate', '방장이 나갔습니다. 새로운 방장이 지정되었습니다.');
            }
            io.to(roomId).emit('playerListUpdate', room.players);
          }
        }
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Liar Game Backend running on http://localhost:${PORT}`);
});
