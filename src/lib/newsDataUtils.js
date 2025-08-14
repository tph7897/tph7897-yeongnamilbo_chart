/**
 * 뉴스 데이터 처리 관련 유틸리티 함수들
 */
import { getNameDepartment } from "@/app/data/userMapping";
import { getDepartmentNameById } from "@/app/data/departmentMapping";
import { getWeekKey } from "./dateUtils";
import { calculateStats } from "./tableUtils";

/**
 * 부서명을 정규화하는 함수
 * @param {string} reporter - 기자명
 * @param {Object} item - 뉴스 아이템
 * @returns {string} 정규화된 부서명
 */
export const normalizeDepartment = (reporter, item) => {
  let department = getNameDepartment(reporter);
  
  if (!department || department === "알 수 없음") {
    if (item.code_name?.trim()) {
      department = item.code_name.trim();
    } else if (item.buseid) {
      const deptFromId = getDepartmentNameById(Number(item.buseid));
      department = deptFromId !== "알 수 없음" ? deptFromId : "-";
    } else {
      department = "-";
    }
  }
  
  return department;
};

/**
 * 뉴스 데이터를 주별, 기자별로 집계
 * @param {Array} newsData - 뉴스 데이터 배열
 * @returns {Array} 주별 기자 데이터 배열
 */
export const aggregateReportersByWeek = (newsData) => {
  if (!newsData?.length) return [];

  const groups = new Map();

  newsData.forEach((item) => {
    const reporter = item.byline_gijaname?.trim();
    if (!reporter) return;

    const department = normalizeDepartment(reporter, item);
    const weekKey = getWeekKey(item.newsdate);

    if (!groups.has(weekKey)) {
      groups.set(weekKey, new Map());
    }

    const weekGroup = groups.get(weekKey);
    if (!weekGroup.has(reporter)) {
      weekGroup.set(reporter, {
        reporter,
        department,
        totalViews: 0,
        articleCount: 0,
        selfArticleCount: 0,
      });
    }

    const reporterStats = weekGroup.get(reporter);
    reporterStats.totalViews += Number(item.ref) || 0;
    reporterStats.articleCount += 1;
    
    if (item.level === "1") {
      reporterStats.selfArticleCount += 1;
    }
  });

  return Array.from(groups.entries())
    .map(([weekKey, reportersMap]) => ({
      datetime: weekKey,
      reporters: Array.from(reportersMap.values()).map(stats => ({
        ...stats,
        ...calculateStats(stats),
      })),
    }))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
};

/**
 * 뉴스 데이터를 주별, 부서별로 집계
 * @param {Array} newsData - 뉴스 데이터 배열
 * @returns {Array} 주별 그룹 배열
 */
export const aggregateDepartmentsByWeek = (newsData) => {
  if (!newsData?.length) return [];

  const groups = new Map();
  
  newsData.forEach((item) => {
    let department = item.code_name;
    if (!department?.trim()) {
      const buseid = Number(item.buseid);
      department = getDepartmentNameById(buseid);
      if (department === "알 수 없음") return;
    }

    const weekKey = getWeekKey(item.newsdate);

    if (!groups.has(weekKey)) {
      groups.set(weekKey, []);
    }
    
    groups.get(weekKey).push({
      ...item,
      code_name: department
    });
  });

  return Array.from(groups.entries())
    .sort((a, b) => new Date(a[0]) - new Date(b[0]));
};

/**
 * 주별 부서 통계 계산
 * @param {Array} weekData - 해당 주의 데이터
 * @returns {Array} 부서별 통계 배열
 */
export const calculateDepartmentStats = (weekData) => {
  if (!weekData?.length) return [];

  const statsMap = new Map();

  weekData.forEach((item) => {
    const dept = item.code_name;
    if (!dept) return;

    if (!statsMap.has(dept)) {
      statsMap.set(dept, {
        department: dept,
        totalViews: 0,
        articleCount: 0,
        selfArticleCount: 0
      });
    }

    const stats = statsMap.get(dept);
    stats.totalViews += Number(item.ref) || 0;
    stats.articleCount += 1;
    
    if (item.level === "1") {
      stats.selfArticleCount += 1;
    }
  });

  return Array.from(statsMap.values()).map(stats => ({
    ...stats,
    ...calculateStats(stats)
  }));
};
