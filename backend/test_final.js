const axios = require('axios');

async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbyjCXPrNd4M0Lf9EuAgDFUWHllT8wDsKTWFzxaR_wDuGEDRpaMO1Uq2wbtTY_XXzxeVUg/exec';
  const prompt = `
당신은 창의적이면서도 논리적인 '게임 콘텐츠 설계자'입니다. 
당신의 목표는 제시된 카테고리를 분석하여 게임의 '일반인'과 '라이어'가 사용할 두 개의 관련 단어를 제시하는 것입니다.

[카테고리]: 일본 애니

[출력 형식]
- 어떤 설명도 하지 말고 오직 JSON 데이터만 출력하세요.
{
  "identified_type": "확정된 개체 타입 및 국적",
  "normal": "선정된 단어 (일반인용)",
  "liar": "선정된 단어 (라이어용, 일반인용과 매우 유사한 것)"
}
`;
  
  try {
    const res = await axios.post(url, new URLSearchParams({ prompt: prompt }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log("Response:", res.data);
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
