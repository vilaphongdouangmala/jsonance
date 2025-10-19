"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ScrollToTopProps {
  containerRef: React.RefObject<
    HTMLElement | HTMLTextAreaElement | HTMLDivElement | null
  >;
  className?: string;
  show?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  containerRef,
  className,
  show = true,
}) => {
  const t = useTranslations();
  const [isScrollable, setIsScrollable] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Check if container is scrollable and track scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkScrollable = () => {
      const hasVerticalScroll = container.scrollHeight > container.clientHeight;
      const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
      setIsScrollable(hasVerticalScroll || hasHorizontalScroll);

      // Check if scrolled down from top
      setIsScrolledDown(container.scrollTop > 50); // Show after scrolling 50px
    };

    // Initial check
    checkScrollable();

    // Listen for scroll events
    const handleScroll = () => {
      setIsScrolledDown(container.scrollTop > 50);
    };

    // Listen for resize events (content changes)
    const handleResize = () => {
      checkScrollable();
    };

    container.addEventListener("scroll", handleScroll);
    container.addEventListener("resize", handleResize);

    // Use ResizeObserver for better content change detection
    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(container);

    // Also observe child mutations for dynamic content
    const mutationObserver = new MutationObserver(checkScrollable);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef]);

  const handleScrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Only show if explicitly enabled, container is scrollable, and user has scrolled down
  if (!show || !isScrollable || !isScrolledDown) return null;

  return (
    <button
      onClick={handleScrollToTop}
      className={cn(
        "flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground",
        "bg-muted/50 hover:bg-muted border rounded transition-all duration-200",
        "absolute bottom-2 right-2 z-10",
        "animate-in fade-in slide-in-from-bottom-2",
        className
      )}
      title={t("tooltips.scrollToTop")}
    >
      <ChevronUp className="w-3 h-3" />
      <span>{t("tooltips.scrollToTop")}</span>
    </button>
  );
};
