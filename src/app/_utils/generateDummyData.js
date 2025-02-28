/**
 * 최소값과 최대값(포함) 사이의 랜덤 정수를 반환합니다.
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 더미 데이터를 생성하는 함수
 * @param {number} num 생성할 기사 개수
 * @returns {Array} 더미 데이터 배열
 */
const generateDummyData = (num) => {
  const dummyData = [];
  // 기준 날짜를 설정 (예: 2025-02-20)
  const baseDate = new Date("2025-02-20T00:00:00.000Z");

  // 각 기사마다 고유의 newsdate를 위해 baseDate에 i일씩 더합니다.
  for (let i = 0; i < num; i++) {
    // newsdate: baseDate에 i일을 더해 생성 (각 기사마다 다름)
    const newsDate = new Date(baseDate);
    newsDate.setUTCDate(baseDate.getUTCDate() + i);

    // 해당 뉴스의 주(일~토)에서 토요일 날짜를 계산
    const forcedSaturday = new Date(newsDate);
    const dayOfWeek = forcedSaturday.getUTCDay(); // 0(일)~6(토)
    const diffToSaturday = 6 - dayOfWeek;
    forcedSaturday.setUTCDate(forcedSaturday.getUTCDate() + diffToSaturday);
    // 고정 시각 12:00:00
    forcedSaturday.setUTCHours(12, 0, 0, 0);

    // visits 배열 항목 수를 1~5개 사이로 랜덤 결정하고,
    // 그 중 한 항목은 반드시 forcedSaturday를 사용합니다.
    const visitCount = randomInt(1, 5);
    const forcedIndex = randomInt(0, visitCount - 1);
    const visits = [];

    for (let j = 0; j < visitCount; j++) {
      let visitDate;
      if (j === forcedIndex) {
        // 반드시 이 항목은 뉴스의 주 토요일
        visitDate = new Date(forcedSaturday);
      } else {
        // 나머지 항목은 newsDate 기준 1~4일 후의 랜덤한 날짜 및 시간
        visitDate = new Date(newsDate);
        visitDate.setUTCDate(newsDate.getUTCDate() + randomInt(1, 4));
        visitDate.setUTCHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59), randomInt(0, 999));
      }
      visits.push({
        datetime: visitDate.toISOString(),
        visits: randomInt(15, 500),
      });
    }

    // 후보 데이터 배열 (원하는 값으로 수정 가능)
    const codeNames = ["논설실", "디지털뉴스부", "편집국", "콘텐츠_체육팀", "경제", "콘텐츠_문화팀", "사진팀"];
    const gijaNames = ["윤철희", "김수영", "허석윤", "서용덕", "정재훈", "정지윤", "임성수", "노진실", "오주석", "조현희", "이현덕"];
    const gijaIds = ["wa910183", "wa910198", "wa910179", "wa900974", "waa13638", "waa14523", "waa11825", "digital", "waa14457", "waa13265", "waa14517", "waa14739", "waa13133"];
    const busidOptions = [1, 16, 2, 31, 7, 8, 9, 221];

    // 각 필드를 랜덤하게 선택
    const codeName = codeNames[randomInt(0, codeNames.length - 1)];
    const gijaName = gijaNames[randomInt(0, gijaNames.length - 1)];
    const gijaId = gijaIds[randomInt(0, gijaIds.length - 1)];
    const buseid = busidOptions[randomInt(0, busidOptions.length - 1)];

    // 간단한 _id, newskey 생성 (원하는 방식으로 수정 가능)
    const _id = "dummy" + (1000 + i);
    const newskey = "20250223" + randomInt(100000, 999999);

    dummyData.push({
      _id,
      newskey,
      newsdate: newsDate.toISOString(),
      buseid,
      code_name: codeName,
      gijaname: gijaName,
      gijaid: gijaId,
      delete: 0,
      deleted: false,
      visits,
    });
  }
  console.log("dummyData", dummyData);
  return dummyData;
};

// 예시: 10개의 더미 데이터를 생성 후 콘솔에 출력

export default generateDummyData;
