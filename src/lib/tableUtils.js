/**
 * 테이블 관련 유틸리티 함수들
 */

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 * @param {string} text - 자를 텍스트
 * @param {number} maxLength - 최대 길이 (기본값: 6)
 * @returns {string} 잘린 텍스트
 */
export const truncateText = (text, maxLength = 6) => {
  return text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * 날짜를 한국 로케일 형식으로 포맷
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 한국 로케일 날짜 문자열
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * 레벨 코드를 한국어로 변환
 * @param {string} level - 레벨 코드
 * @returns {string} 한국어 레벨
 */
export const formatLevel = (level) => {
  switch (level) {
    case "1": return "자체";
    default: return "비자체"; // 1등급이 아닌 모든 등급은 비자체
  }
};

/**
 * 레벨에 따른 CSS 클래스 반환
 * @param {string} level - 레벨 코드
 * @returns {string} CSS 클래스 문자열
 */
export const getLevelClass = (level) => {
  switch (level) {
    case "1": return "bg-blue-100 text-blue-800"; // 자체
    default: return "bg-gray-100 text-gray-800"; // 비자체 (기존 일반 스타일 사용)
  }
};

/**
 * 자체비율에 따른 CSS 클래스 반환
 * @param {number} selfRatio - 자체비율
 * @returns {string} CSS 클래스 문자열
 */
export const getSelfRatioClass = (selfRatio) => {
  if (selfRatio < 30) {
    return "bg-red-100 text-red-800"; // 29 이하: 붉은색
  } else if (selfRatio >= 30 && selfRatio <= 39) {
    return "bg-yellow-100 text-yellow-800"; // 30-39: 노란색
  } else {
    return "bg-green-100 text-green-800"; // 40 이상: 녹색
  }
};

/**
 * 배열을 정렬하는 함수
 * @param {Array} array - 정렬할 배열
 * @param {string} column - 정렬 기준 컬럼
 * @param {string} direction - 정렬 방향 ('asc' | 'desc')
 * @returns {Array} 정렬된 배열
 */
export const sortArray = (array, column, direction) => {
  if (!column) return array;

  return [...array].sort((a, b) => {
    const aValue = a[column];
    const bValue = b[column];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
};

/**
 * 통계 계산 함수
 * @param {Object} stats - 통계 객체 { totalViews, articleCount, selfArticleCount }
 * @returns {Object} 계산된 통계 { averageViews, selfRatio }
 */
export const calculateStats = (stats) => {
  const averageViews = stats.articleCount > 0 
    ? Math.round(stats.totalViews / stats.articleCount * 100) / 100 
    : 0;
  
  const selfRatio = stats.articleCount > 0 
    ? Math.round((stats.selfArticleCount / stats.articleCount) * 1000) / 10
    : 0;

  return { averageViews, selfRatio };
};
