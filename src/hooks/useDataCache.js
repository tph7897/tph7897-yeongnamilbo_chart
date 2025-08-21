import { useState, useEffect, useRef } from 'react';

/**
 * 데이터 캐싱 훅
 * 동일한 API 요청을 캐시하여 중복 호출을 방지
 */
export const useDataCache = () => {
  const cache = useRef(new Map());
  
  const getCachedData = (key) => {
    return cache.current.get(key);
  };
  
  const setCachedData = (key, data) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  };
  
  const isCacheValid = (key, maxAge = 5 * 60 * 1000) => { // 5분 캐시
    const cached = cache.current.get(key);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < maxAge;
  };
  
  const clearCache = () => {
    cache.current.clear();
  };
  
  return {
    getCachedData,
    setCachedData,
    isCacheValid,
    clearCache
  };
};

/**
 * 스마트 데이터 로딩 훅
 * 백그라운드에서 데이터를 미리 로드하고 캐시
 */
export const useSmartDataLoader = (initialParams) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getCachedData, setCachedData, isCacheValid } = useDataCache();
  
  const loadData = async (params = initialParams) => {
    const cacheKey = JSON.stringify(params);
    
    // 캐시된 데이터가 유효하면 반환
    if (isCacheValid(cacheKey)) {
      const cached = getCachedData(cacheKey);
      setData(cached.data);
      return cached.data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/fetchAllArticles?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 응답이 비어있는 경우 처리
      if (response.status === 204) {
        setData([]);
        return [];
      }
      
      // 안전한 JSON 파싱
      let result;
      try {
        const text = await response.text();
        if (!text.trim()) {
          setData([]);
          return [];
        }
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('서버에서 받은 데이터를 처리할 수 없습니다. 데이터에 잘못된 문자가 포함되어 있을 수 있습니다.');
      }
      
      // 캐시에 저장
      setCachedData(cacheKey, result);
      setData(result);
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Data loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    data,
    isLoading,
    error,
    loadData
  };
};
