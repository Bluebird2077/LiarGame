import { io } from 'socket.io-client';

// Netlify에 배포할 때 환경 변수(VITE_BACKEND_URL)를 통해 Render의 서버 주소를 동적으로 주입받습니다.
// 로컬 개발 시에는 환경 변수가 없으므로 기본값인 localhost:3001을 사용합니다.
const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: false,
});
