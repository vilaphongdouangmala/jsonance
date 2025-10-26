"use client";

import React, { useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStringPerformance } from "../hooks/use-string-performance";

interface PerformanceMonitorProps {
  className?: string;
  showByDefault?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  showByDefault = false,
}) => {
  const [isVisible, setIsVisible] = useState(showByDefault);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    metrics,
    config,
    warnings,
    resetMetrics,
    updateConfig,
    getFormattedMemoryUsage,
    isPerformanceGood,
  } = useStringPerformance();

  if (!isVisible && warnings.length === 0) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-muted hover:bg-muted/80 rounded-full shadow-lg transition-colors z-50"
        title="Show performance monitor"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  const getStatusIcon = () => {
    if (warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return isPerformanceGood() ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <Activity className="w-4 h-4 text-blue-500" />;
  };

  const getStatusColor = () => {
    if (warnings.length > 0) return "border-yellow-500";
    return isPerformanceGood() ? "border-green-500" : "border-blue-500";
  };

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 max-w-sm z-50",
      getStatusColor(),
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">Performance Monitor</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-muted rounded"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-muted rounded"
            title="Hide monitor"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-3 space-y-1">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
              <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-800 dark:text-yellow-200">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-muted-foreground">Total Strings:</span>
            <div className="font-mono">{metrics.totalStrings}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Long Strings:</span>
            <div className="font-mono">{metrics.longStrings}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Very Long:</span>
            <div className="font-mono">{metrics.veryLongStrings}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Memory:</span>
            <div className="font-mono">{getFormattedMemoryUsage()}</div>
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Render Time:</span>
          <div className="font-mono">{metrics.renderTime}ms</div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div className="text-xs font-medium">Settings</div>
          
          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between">
              <span>Max String Length:</span>
              <input
                type="number"
                value={config.maxStringLength}
                onChange={(e) => updateConfig({ maxStringLength: parseInt(e.target.value) || 1000 })}
                className="w-16 px-1 py-0.5 border rounded text-xs"
                min="100"
                max="10000"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span>Memory Limit (MB):</span>
              <input
                type="number"
                value={config.memoryLimit}
                onChange={(e) => updateConfig({ memoryLimit: parseInt(e.target.value) || 50 })}
                className="w-16 px-1 py-0.5 border rounded text-xs"
                min="10"
                max="500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span>Image Preview:</span>
              <input
                type="checkbox"
                checked={config.enableImagePreview}
                onChange={(e) => updateConfig({ enableImagePreview: e.target.checked })}
                className="rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t flex gap-2">
        <button
          onClick={resetMetrics}
          className="flex-1 px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
        >
          Reset Metrics
        </button>
      </div>
    </div>
  );
};
