async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbyrVpQlVT-Wqecaqju_uUTrQqR8tCJXPY_suVEP1dhiPEoxjRm-EuT1qsiXRmE0P4lGNQ/exec';
  const category = '동물';
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
- 반드시 '${category}'의 정의에 100% 부합하는 일치하는 것만 포함합니다.

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
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({ prompt: prompt }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log("Status:", response.status);
    const data = await response.text();
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
