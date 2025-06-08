import { useState, useEffect } from 'react';

interface UseMediaQuery {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useMobile(): UseMediaQuery {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
  const isDesktop = dimensions.width >= 1024 && dimensions.width < 1440;
  const isLarge = dimensions.width >= 1440;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
  };
}

export function useBreakpoint() {
  const { isMobile, isTablet, isDesktop, isLarge } = useMobile();
  
  return {
    xs: isMobile,
    sm: isMobile,
    md: isTablet,
    lg: isDesktop,
    xl: isLarge,
    current: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'
  };
}