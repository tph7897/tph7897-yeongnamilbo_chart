/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 주어진 날짜의 주 토요일 계산
 * @param {Date|string} date - 계산할 날짜
 * @returns {Date} 해당 주의 토요일 Date 객체
 */
export const getWeekSaturday = (date) => {
  const d = new Date(date);
  // UTC 시간대 문제 해결을 위해 UTC 메서드 사용
  const diff = 6 - d.getUTCDay(); // 토요일까지 남은 일수
  const saturday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return saturday;
};

/**
 * 주어진 날짜의 주 키 생성 (토요일 기준 ISO 문자열)
 * @param {Date|string} date - 계산할 날짜
 * @returns {string} 주 키 (ISO 문자열)
 */
export const getWeekKey = (date) => {
  return getWeekSaturday(date).toISOString();
};

/**
 * 날짜를 한국 형식으로 포맷 (YY.MM.DD)
 * @param {Date|string} date - 포맷할 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
export const formatKoreanDate = (date) => {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
  return `${yy}.${mm}.${dd}`;
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
 * 주어진 날짜의 월 키 생성 (해당 월의 첫 번째 날 기준)
 * @param {Date|string} date - 계산할 날짜
 * @returns {string} 월 키 (ISO 문자열)
 */
export const getMonthKey = (date) => {
  const d = new Date(date);
  // UTC 시간대 문제 해결을 위해 UTC 메서드 사용
  const firstDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  return firstDay.toISOString();
};

/**
 * 월 키를 한국어 형식으로 포맷 (YYYY년 MM월)
 * @param {string} monthKey - 월 키 (ISO 문자열)
 * @returns {string} 포맷된 월 문자열
 */
export const formatMonth = (monthKey) => {
  const date = new Date(monthKey);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long'
  });
};
