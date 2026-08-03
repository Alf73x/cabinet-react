// src/api.ts

const API_URL = import.meta.env.VITE_API_URL;

const USER = import.meta.env.VITE_API_USER;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

const BASIC_AUTH =
  USER && PASSWORD ? "Basic " + btoa(`${USER}:${PASSWORD}`) : null;

const TOKEN_KEY = "cabinet_access_token";

function getJwtToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

type AuthType = "jwt" | "basic" | "none";

function createHeaders(authType: AuthType): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (authType === "jwt") {
    const token = getJwtToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  if (authType === "basic" && BASIC_AUTH) {
    headers.Authorization = BASIC_AUTH;
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP ${response.status}`;

    try {
      const data = await response.json();

      if (typeof data.error === "string") {
        message = data.error;
      } else if (typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // Ответ сервера не является JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(
  url: string,
  authType: AuthType = "jwt",
): Promise<T> {
  console.log("API_URL:", API_URL);
  console.log("Full URL:", `${API_URL}${url}`);

  const response = await fetch(`${API_URL}${url}`, {
    method: "GET",
    headers: createHeaders(authType),
  });

  console.log("Response status:", response.status, response.statusText);

  const result = await parseResponse<T>(response);

  console.log("Parsed response:", result);

  return result;
}

export async function apiPost<TResponse>(
  url: string,
  data: unknown,
  authType: AuthType = "jwt",
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: createHeaders(authType),
    body: JSON.stringify(data),
  });

  return parseResponse<TResponse>(response);
}
