export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetchBinary failed: ${res.status}`);
  }
  return res.arrayBuffer();
}

declare global {
  interface Window {
    __PREFETCH__?: Record<string, Promise<unknown>>;
  }
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const prefetched = window.__PREFETCH__?.[url];
  if (prefetched) {
    delete window.__PREFETCH__![url];
    return prefetched as Promise<T>;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetchJSON failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`sendFile failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`sendJSON failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
