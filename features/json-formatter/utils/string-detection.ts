export type StringType =
  | "normal"
  | "base64-image"
  | "base64-data"
  | "url"
  | "long-text"
  | "json"
  | "xml";

export interface StringAnalysis {
  type: StringType;
  length: number;
  isLong: boolean;
  isVeryLong: boolean;
  shouldTruncate: boolean;
  metadata?: {
    imageFormat?: string;
    estimatedSize?: string;
    isValidJson?: boolean;
    isValidXml?: boolean;
  };
}

// Performance thresholds
export const STRING_THRESHOLDS = {
  SHORT: 100,
  MEDIUM: 500,
  LONG: 5000,
  VERY_LONG: 50000,
} as const;

/**
 * Detect the type and characteristics of a string
 */
export function analyzeString(str: string): StringAnalysis {
  const length = str.length;
  const isLong = length > STRING_THRESHOLDS.SHORT;
  const isVeryLong = length > STRING_THRESHOLDS.LONG;
  const shouldTruncate = length > STRING_THRESHOLDS.SHORT;

  // Base64 image detection (data URI)
  const base64ImageMatch = str.match(/^data:image\/([^;]+);base64,(.+)$/);
  if (base64ImageMatch) {
    const [, format, data] = base64ImageMatch;
    const estimatedSize = Math.round((data.length * 3) / 4 / 1024); // KB
    return {
      type: "base64-image",
      length,
      isLong,
      isVeryLong,
      shouldTruncate,
      metadata: {
        imageFormat: format,
        estimatedSize: `${estimatedSize}KB`,
      },
    };
  }

  // Base64 data detection (without data URI prefix)
  if (length > 100 && /^[A-Za-z0-9+/]+=*$/.test(str)) {
    const estimatedSize = Math.round((length * 3) / 4 / 1024); // KB
    return {
      type: "base64-data",
      length,
      isLong,
      isVeryLong,
      shouldTruncate,
      metadata: {
        estimatedSize: `${estimatedSize}KB`,
      },
    };
  }

  // URL detection
  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("ftp://")
  ) {
    return {
      type: "url",
      length,
      isLong,
      isVeryLong,
      shouldTruncate,
    };
  }

  // JSON detection
  if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
    try {
      JSON.parse(str);
      return {
        type: "json",
        length,
        isLong,
        isVeryLong,
        shouldTruncate,
        metadata: {
          isValidJson: true,
        },
      };
    } catch {
      // Not valid JSON, continue with other checks
    }
  }

  // XML detection
  if (str.trim().startsWith("<") && str.trim().endsWith(">")) {
    return {
      type: "xml",
      length,
      isLong,
      isVeryLong,
      shouldTruncate,
      metadata: {
        isValidXml: true, // Basic check, could be enhanced
      },
    };
  }

  // Long text or normal string
  const type = isLong ? "long-text" : "normal";
  return {
    type,
    length,
    isLong,
    isVeryLong,
    shouldTruncate,
  };
}

/**
 * Get a human-readable description of the string type
 * @param analysis - String analysis result
 * @param t - Translation function (optional, for localization)
 */
export function getStringTypeDescription(
  analysis: StringAnalysis,
  t?: (key: string, params?: Record<string, unknown>) => string
): string {
  if (!t) {
    // Fallback to English if no translation function provided
    switch (analysis.type) {
      case "base64-image":
        return `Base64 Image (${analysis.metadata?.imageFormat?.toUpperCase()}
        })`;
      case "base64-data":
        return `Base64 Data`;
      case "url":
        return "URL";
      case "json":
        return "JSON String";
      case "xml":
        return "XML String";
      case "long-text":
        return `Long Text (${analysis.length.toLocaleString()} chars)`;
      default:
        return "Text";
    }
  }

  // Use translation function
  switch (analysis.type) {
    case "base64-image":
      return t("stringTypes.base64Image", {
        format: analysis.metadata?.imageFormat?.toUpperCase(),
      });
    case "base64-data":
      return t("stringTypes.base64Data");
    case "url":
      return t("stringTypes.url");
    case "json":
      return t("stringTypes.jsonString");
    case "xml":
      return t("stringTypes.xmlString");
    case "long-text":
      return t("stringTypes.longText", {
        count: analysis.length.toLocaleString(),
      });
    default:
      return t("stringTypes.text");
  }
}

/**
 * Format file size in human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
