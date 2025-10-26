"use client";

import { useState, useEffect, useCallback } from "react";

interface PerformanceMetrics {
  totalStrings: number;
  longStrings: number;
  veryLongStrings: number;
  estimatedMemoryUsage: number; // in bytes
  renderTime: number; // in milliseconds
}

interface PerformanceConfig {
  maxStringLength: number;
  enableImagePreview: boolean;
  enableVirtualScrolling: boolean;
  memoryLimit: number; // in MB
}

const DEFAULT_CONFIG: PerformanceConfig = {
  maxStringLength: 1000,
  enableImagePreview: true,
  enableVirtualScrolling: true,
  memoryLimit: 50, // 50MB
};

export function useStringPerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalStrings: 0,
    longStrings: 0,
    veryLongStrings: 0,
    estimatedMemoryUsage: 0,
    renderTime: 0,
  });

  const [config, setConfig] = useState<PerformanceConfig>(DEFAULT_CONFIG);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Track string rendering
  const trackStringRender = useCallback((stringLength: number, renderTime: number) => {
    setMetrics(prev => {
      const isLong = stringLength > 500;
      const isVeryLong = stringLength > 5000;
      
      return {
        totalStrings: prev.totalStrings + 1,
        longStrings: prev.longStrings + (isLong ? 1 : 0),
        veryLongStrings: prev.veryLongStrings + (isVeryLong ? 1 : 0),
        estimatedMemoryUsage: prev.estimatedMemoryUsage + (stringLength * 2), // 2 bytes per char (UTF-16)
        renderTime: prev.renderTime + renderTime,
      };
    });
  }, []);

  // Check for performance warnings
  useEffect(() => {
    const newWarnings: string[] = [];
    
    if (metrics.estimatedMemoryUsage > config.memoryLimit * 1024 * 1024) {
      newWarnings.push(`Memory usage (${Math.round(metrics.estimatedMemoryUsage / 1024 / 1024)}MB) exceeds limit (${config.memoryLimit}MB)`);
    }
    
    if (metrics.veryLongStrings > 10) {
      newWarnings.push(`${metrics.veryLongStrings} very long strings detected - consider using virtual scrolling`);
    }
    
    if (metrics.renderTime > 1000) {
      newWarnings.push(`Total render time (${metrics.renderTime}ms) is high - performance may be affected`);
    }
    
    setWarnings(newWarnings);
  }, [metrics, config]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      totalStrings: 0,
      longStrings: 0,
      veryLongStrings: 0,
      estimatedMemoryUsage: 0,
      renderTime: 0,
    });
    setWarnings([]);
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<PerformanceConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Get formatted memory usage
  const getFormattedMemoryUsage = useCallback(() => {
    const bytes = metrics.estimatedMemoryUsage;
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, [metrics.estimatedMemoryUsage]);

  // Check if performance is good
  const isPerformanceGood = useCallback(() => {
    return warnings.length === 0 && 
           metrics.renderTime < 500 && 
           metrics.estimatedMemoryUsage < config.memoryLimit * 1024 * 1024 * 0.8;
  }, [warnings.length, metrics.renderTime, metrics.estimatedMemoryUsage, config.memoryLimit]);

  return {
    metrics,
    config,
    warnings,
    trackStringRender,
    resetMetrics,
    updateConfig,
    getFormattedMemoryUsage,
    isPerformanceGood,
  };
}
