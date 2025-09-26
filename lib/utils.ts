import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseMetadata(input: string): Record<string, unknown> | undefined {
  
  if (!input.trim()) return undefined;
  
  try {
    let normalized = input.trim();
    
    // Case 1: If it's already a valid JSON object string
    if (normalized.startsWith('{') && normalized.endsWith('}')) {
      return JSON.parse(normalized);
    }

    // Case 2: It's just key:value pairs (without { })
    normalized = `{${normalized}}`;

    // Try parsing, allowing numbers
    return JSON.parse(normalized, (_key, value) => {
      // If value is a string that looks like a number, convert it
      if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
      }
      return value;
    });
  } catch (error) {
    console.error("Invalid metadata string:", error);
    return undefined;
  }
}


export function beautifyMetadata(input: string): string {
  if (!input.trim()) return "";

  try {
    let normalized = input.trim();

    // If not wrapped in { }, wrap it
    if (!normalized.startsWith("{") || !normalized.endsWith("}")) {
      normalized = `{${normalized}}`;
    }

    // Parse JSON
    const obj = JSON.parse(normalized, (_key, value) => {
      // Auto-convert numbers
      if (typeof value === "string" && /^-?\d+(\.\d+)?$/.test(value)) {
        return Number(value);
      }
      return value;
    });

    // Beautify JSON with indentation
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    console.error("Invalid metadata string:", err);
    return input;
  }
}

