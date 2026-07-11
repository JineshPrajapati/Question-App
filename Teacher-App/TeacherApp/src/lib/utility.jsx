export const isImageLoadable = (blobUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = blobUrl;

    img.onload = () => resolve(true); // Image loaded successfully
    img.onerror = () => resolve(false); // Error loading the image
  });
};

export const minutesToHHMM = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const convertMinutesToTime = (time) => {
  let hours = parseInt(time.split(":")[0]);
  let minutes = parseInt(time.split(":")[1]);
  let totalMinutes = hours * 60 + minutes;
  return totalMinutes;
};

export const formatTimeLabel = (timeStr) => {
  const parts = timeStr.split(":").map(Number);

  let hours = 0;
  let minutes = 0;

  if (parts.length === 3) {
    [hours, minutes] = [parts[0], parts[1]];
  } else if (parts.length === 2) {
    [hours, minutes] = [parts[0], parts[1]];
  }

  let result = "";
  if (hours > 0) result += `${hours}hr `;
  if (minutes > 0) result += `${minutes}mins`;

  return result.trim() || "0mins";
};

const statusColorMap = {
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-red-100 text-red-800",
  Medium: "bg-green-100 text-green-800",
  Low: "bg-blue-100 text-blue-800",
};
export const getStatusColor = (statusName) => {
  return statusColorMap[statusName] || "bg-gray-200 text-gray-800";
};

const taskStatusColorMap = {
  Upcoming: "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Completed: "bg-green-100 text-green-800",
  "Not Needed": "bg-gray-100 text-gray-800",
  "Resident Refused": "bg-red-100 text-red-800",
};
export const getTaskStatusColor = (assignStatus) => {
  return taskStatusColorMap[assignStatus] || "bg-gray-200 text-gray-800";
};

export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

import { clsx  } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs ) {
  return twMerge(clsx(inputs))
}

export function convertToMMDDYYYY(dateStr) {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-");
    return `${month}-${day}-${year}`;
}

export function normalizeKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map((item) => normalizeKeys(item));
    } else if (obj !== null && typeof obj === "object") {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k.toLowerCase(), normalizeKeys(v)])
        );
    }
    return obj;
}
export function toCamelCase(str) {
    return str
        .replace(/([-_][a-z])/gi, (s) => s.toUpperCase().replace(/[-_]/g, ""))
        .replace(/^[A-Z]/, (s) => s.toLowerCase());
}

export function keysToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map((v) => keysToCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [toCamelCase(k), keysToCamelCase(v)])
        );
    }
    return obj;
}
