"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface LineNumbersProps extends React.HTMLAttributes<HTMLDivElement> {
  lineCount: number;
  currentLine?: number;
  lineHeight?: string;
}

const LineNumbers = forwardRef<HTMLDivElement, LineNumbersProps>(
  ({ lineCount, currentLine = 0, lineHeight = "1.5rem", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "select-none bg-muted/50 text-muted-foreground py-2 pr-2 text-right overflow-hidden border-r",
          className
        )}
        style={{
          overflowY: "hidden",
          lineHeight,
        }}
        {...props}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i + 1}
            className={cn(
              "px-2",
              currentLine === i + 1 && "bg-accent text-accent-foreground font-medium"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    );
  }
);

LineNumbers.displayName = "LineNumbers";

export { LineNumbers };
