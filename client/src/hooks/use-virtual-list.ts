import { useState, useMemo, useEffect, useRef } from 'react';

interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan, items.length);
    const offsetY = startIndex * itemHeight;

    return {
      items: items.slice(Math.max(0, startIndex - overscan), endIndex),
      startIndex: Math.max(0, startIndex - overscan),
      offsetY,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  const totalHeight = items.length * itemHeight;

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const handleScroll = () => {
      setScrollTop(element.scrollTop);
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    scrollToIndex: (index: number) => {
      if (scrollElementRef.current) {
        scrollElementRef.current.scrollTo({
          top: index * itemHeight,
          behavior: 'smooth',
        });
      }
    },
  };
}