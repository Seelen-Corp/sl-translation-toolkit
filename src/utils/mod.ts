export function asyncSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function invokeWithGaps<R>(
  tasks: Array<() => R>,
  gap: number,
): Promise<Array<R>> {
  const results: Array<R> = [];
  for (const task of tasks) {
    results.push(task());
    await asyncSleep(gap);
  }
  return results;
}

export function deepSortObject<T>(obj: T): T {
  if (Array.isArray(obj)) {
    // if it's an array, recursively sort its elements
    return obj.map(deepSortObject) as unknown as T;
  } else if (obj !== null && typeof obj === "object") {
    // if it's an object, sort its entries
    const sortedEntries = Object.entries(obj)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort keys
      .map(([key, value]) => [key, deepSortObject(value)]); // Recursively sort values

    return Object.fromEntries(sortedEntries) as T;
  }
  // if it's not an array or object, return it as is
  return obj;
}

export function forEachString(
  obj: unknown,
  cb: (path: string, value: string) => void,
  prefix = "",
): void {
  if (!obj || typeof obj !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : `${key}`;

    if (typeof value === "string") {
      cb(path, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "string") {
          cb(`${path}.${i}`, item);
        }
      });
    } else if (value && typeof value === "object") {
      forEachString(value, cb, path);
    }
  }
}

export function hashTableFromObject<T>(obj: T): Map<string, string> {
  const table = new Map<string, string>();
  forEachString(obj, (path, value) => table.set(path, fnv1a32(value)));
  return table;
}

function fnv1a32(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16);
}
