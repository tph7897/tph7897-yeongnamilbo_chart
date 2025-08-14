/**
 * 테이블 공통 훅들
 */
import { useState, useMemo } from "react";
import { sortArray } from "@/lib/tableUtils";

/**
 * 테이블 정렬 기능을 제공하는 훅
 * @param {string} initialColumn - 초기 정렬 컬럼
 * @param {string} initialDirection - 초기 정렬 방향
 * @returns {Object} 정렬 상태와 핸들러
 */
export const useTableSort = (initialColumn = "", initialDirection = "desc") => {
  const [sortColumn, setSortColumn] = useState(initialColumn);
  const [sortDirection, setSortDirection] = useState(initialDirection);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortData = (data) => {
    return sortArray(data, sortColumn, sortDirection);
  };

  return {
    sortColumn,
    sortDirection,
    handleSort,
    sortData,
  };
};

/**
 * 주별 데이터 선택 기능을 제공하는 훅
 * @param {Array} weeklyData - 주별 데이터 배열
 * @returns {Object} 주 선택 상태와 핸들러
 */
export const useWeekSelection = (weeklyData) => {
  const [selectedWeek, setSelectedWeek] = useState("");

  // 현재 선택된 주 (자동 선택 포함)
  const currentWeek = selectedWeek || (weeklyData[weeklyData.length - 1]?.datetime || weeklyData[weeklyData.length - 1]?.[0] || "");

  return {
    selectedWeek,
    setSelectedWeek,
    currentWeek,
  };
};

/**
 * 부서 필터링 기능을 제공하는 훅
 * @param {Array} data - 필터링할 데이터
 * @param {string} departmentKey - 부서 속성 키
 * @returns {Object} 부서 필터 상태와 옵션
 */
export const useDepartmentFilter = (data, departmentKey = "department") => {
  const [selectedDepartment, setSelectedDepartment] = useState("전체 부서");

  // 부서 옵션 목록
  const departmentOptions = useMemo(() => {
    const deptSet = new Set();
    data.forEach(item => {
      const dept = item[departmentKey] || "-";
      deptSet.add(dept);
    });
    return ["전체 부서", ...Array.from(deptSet).sort()];
  }, [data, departmentKey]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (selectedDepartment === "전체 부서") {
      return data;
    }
    return data.filter(item => 
      (item[departmentKey] || "-") === selectedDepartment
    );
  }, [data, selectedDepartment, departmentKey]);

  return {
    selectedDepartment,
    setSelectedDepartment,
    departmentOptions,
    filteredData,
  };
};
