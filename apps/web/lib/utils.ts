import { locales } from "@/i18n";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalStorage(Item: string) {
  const data = localStorage.getItem(Item);
  return data;
}

export function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function setAuthLocalStorage(window: Window, objects: any) {
  if (window) {
    let existedData = JSON.parse(
      window.localStorage.getItem("DATA") || '{}'
    )
    existedData = {
      ...existedData,
      ...objects
    }
    window.localStorage.setItem("DATA", JSON.stringify(existedData))
  }
}

export function getAuthLocalStorage(window: Window, key: string) {
  if (window) {
    const data = JSON.parse(window.localStorage.getItem("DATA") || '{}')
    return data[key]
  }
  return null
}


export const detectLocale = (locale: string): (typeof locales)[number] => {
  const detectedLocale = locale.split("-")[0];
  if (["en", "zh", "ja"].includes(detectedLocale as (typeof locales)[number])) {
    return detectedLocale as (typeof locales)[number];
  }
  return locales[0];
};




type CallbackFunction = (...args: any[]) => void;

export function debounce<T extends CallbackFunction>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export default debounce;
