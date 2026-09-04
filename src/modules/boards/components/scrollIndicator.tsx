'use client';

import { useEffect, useRef, useState } from 'react';
import { CustomStatus } from '@/src/types/colors';

interface ScrollIndicatorProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  statuses: CustomStatus[];
  userStoriesCount: number;
}

export const ScrollIndicator = ({
  scrollContainerRef,
  statuses,
  userStoriesCount,
}: ScrollIndicatorProps) => {
  const [scrollState, setScrollState] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } =
        container;

      setScrollState({
        scrollLeft,
        scrollTop,
        scrollWidth,
        scrollHeight,
        clientWidth,
        clientHeight,
      });

      // Show indicator when scrolling
      setIsVisible(true);

      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      // Hide after 2 seconds of no scrolling (increased from 1.5s)
      hideTimeoutRef.current = setTimeout(() => {
        if (!isDragging) {
          setIsVisible(false);
        }
      }, 2000);
    };

    // Initial state
    updateScrollState();

    // Listen to scroll events
    container.addEventListener('scroll', updateScrollState);

    // Listen to resize to update dimensions
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [scrollContainerRef, isDragging]);

  // Always call the hook, but conditionally add/remove listener
  useEffect(() => {
    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging]);

  const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } =
    scrollState;

  // Calculate if content is scrollable
  const hasHorizontalScroll = scrollWidth > clientWidth;
  const hasVerticalScroll = scrollHeight > clientHeight;
  const isScrollable = hasHorizontalScroll || hasVerticalScroll;

  // Calculate indicator dimensions and position
  const indicatorWidth = 160; // Increased width to show columns better
  const indicatorHeight = 100; // Increased height
  const padding = 6; // Increased padding

  // Calculate the viewport box dimensions (proportional to visible area)
  const viewportBoxWidth = hasHorizontalScroll
    ? Math.max(20, (clientWidth / scrollWidth) * (indicatorWidth - padding * 2))
    : indicatorWidth - padding * 2;

  const viewportBoxHeight = hasVerticalScroll
    ? Math.max(20, (clientHeight / scrollHeight) * (indicatorHeight - padding * 2))
    : indicatorHeight - padding * 2;

  // Calculate the position of the viewport box within the indicator
  const maxScrollLeft = scrollWidth - clientWidth;
  const maxScrollTop = scrollHeight - clientHeight;

  const viewportBoxLeft =
    hasHorizontalScroll && maxScrollLeft > 0
      ? (scrollLeft / maxScrollLeft) * (indicatorWidth - padding * 2 - viewportBoxWidth) + padding
      : padding;

  const viewportBoxTop =
    hasVerticalScroll && maxScrollTop > 0
      ? (scrollTop / maxScrollTop) * (indicatorHeight - padding * 2 - viewportBoxHeight) + padding
      : padding;

  // Handle click/drag on indicator to navigate
  const handleIndicatorInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const rect = indicator.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate scroll position based on click position
    const scrollPercentX = (x - padding) / (indicatorWidth - padding * 2);
    const scrollPercentY = (y - padding) / (indicatorHeight - padding * 2);

    const targetScrollLeft = Math.max(0, Math.min(maxScrollLeft, scrollPercentX * maxScrollLeft));
    const targetScrollTop = Math.max(0, Math.min(maxScrollTop, scrollPercentY * maxScrollTop));

    container.scrollTo({
      left: targetScrollLeft,
      top: targetScrollTop,
      behavior: 'smooth',
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setIsVisible(true);
    handleIndicatorInteraction(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleIndicatorInteraction(e);
    }
  };

  // Calculate column widths proportionally
  const storyColumnWidth = 200; // Approximate width of story column
  const statusColumnWidth = 240; // Approximate width of each status column
  const totalBoardWidth = storyColumnWidth + statuses.length * statusColumnWidth;
  const availableWidth = indicatorWidth - padding * 2;

  // Story column takes proportional space
  const indicatorStoryWidth = (storyColumnWidth / totalBoardWidth) * availableWidth;
  const indicatorStatusWidth = (statusColumnWidth / totalBoardWidth) * availableWidth;

  // Don't render if content is not scrollable - check AFTER all hooks
  if (!isScrollable) return null;

  return (
    <div
      ref={indicatorRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsVisible(true)}
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-300 cursor-pointer ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } hover:opacity-100`}
      style={{
        width: `${indicatorWidth}px`,
        height: `${indicatorHeight}px`,
      }}
    >
      {/* Outer container - represents the entire scrollable area */}
      <div
        className="relative w-full h-full rounded-lg border-3 border-blue-600 bg-white shadow-xl"
        style={{
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Column representations matching the actual board */}
        <div className="absolute inset-0 flex" style={{ padding: `${padding}px` }}>
          {/* Story column */}
          <div
            className="flex-shrink-0 border-r-2 border-gray-400 bg-gray-100/80"
            style={{ width: `${indicatorStoryWidth}px` }}
          />

          {/* Status columns */}
          {statuses.map((status, index) => (
            <div
              key={status.id}
              className="flex-shrink-0 relative"
              style={{
                width: `${indicatorStatusWidth}px`,
                borderRight: index < statuses.length - 1 ? '2px solid #9ca3af' : 'none',
                backgroundColor: `${status.color}15`, // 15 is hex for low opacity
              }}
            >
              {/* Status color indicator at top */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: status.color }}
              />
            </div>
          ))}
        </div>

        {/* User story rows indicators */}
        {userStoriesCount > 1 && (
          <div
            className="absolute flex flex-col justify-evenly pointer-events-none"
            style={{
              left: `${padding}px`,
              right: `${padding}px`,
              top: `${padding}px`,
              bottom: `${padding}px`,
            }}
          >
            {[...Array(Math.min(userStoriesCount - 1, 5))].map((_, i) => (
              <div key={i} className="h-px w-full bg-gray-400/60" />
            ))}
          </div>
        )}

        {/* Inner box - represents the visible viewport */}
        <div
          className="absolute rounded-md bg-blue-600/30 border-2 border-blue-700 shadow-inner transition-all duration-100 overflow-hidden"
          style={{
            left: `${viewportBoxLeft}px`,
            top: `${viewportBoxTop}px`,
            width: `${viewportBoxWidth}px`,
            height: `${viewportBoxHeight}px`,
            pointerEvents: 'none',
          }}
        >
          {/* Render columns inside viewport - they will be clipped to show only visible portion */}
          <div
            className="absolute inset-0 flex"
            style={{
              left: `-${viewportBoxLeft - padding}px`,
            }}
          >
            {/* Story column */}
            <div
              className="flex-shrink-0 border-r-2 border-blue-400/60"
              style={{ width: `${indicatorStoryWidth}px` }}
            />

            {/* Status columns */}
            {statuses.map((status, index) => (
              <div
                key={status.id}
                className="flex-shrink-0 relative"
                style={{
                  width: `${indicatorStatusWidth}px`,
                  borderRight:
                    index < statuses.length - 1 ? '2px solid rgba(96, 165, 250, 0.6)' : 'none',
                }}
              >
                <div className="absolute inset-0 bg-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll percentage text */}
      <div className="absolute -top-7 right-0 text-xs font-semibold text-gray-700 dark:text-slate-100 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
        {hasHorizontalScroll && <span>{Math.round((scrollLeft / maxScrollLeft) * 100)}%</span>}
        {hasHorizontalScroll && hasVerticalScroll && <span className="mx-1.5">·</span>}
        {hasVerticalScroll && <span>{Math.round((scrollTop / maxScrollTop) * 100)}%</span>}
      </div>

      {/* Hint text on first hover */}
      <div className="absolute -top-[52px] right-0 text-[10px] text-gray-500 dark:text-gray-400 bg-white/95 dark:bg-gray-800/95 px-2 py-0.5 rounded shadow-sm border border-gray-200 dark:border-gray-700 dark:text-slate-100">
        Click to navigate
      </div>
    </div>
  );
};
