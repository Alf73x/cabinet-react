// src/api.ts

const API_URL = import.meta.env.VITE_API_URL;
const USER = import.meta.env.VITE_API_USER;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

const AUTH =
  "Basic " + btoa(`${USER}:${PASSWORD}`);

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    method: "GET",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

export async function apiPost<T>(
  url: string,
  data: any
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}