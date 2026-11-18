// No iPhone, use o IP LAN do computador onde o Spring Boot está executando.
// A variável EXPO_PUBLIC_API_URL permite trocar o endereço sem editar o código.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.0.4:8080";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  const responseText = await response.text();
  return responseText ? (JSON.parse(responseText) as T) : (undefined as T);
}

export async function apiPut<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  const responseText = await response.text();
  return responseText ? (JSON.parse(responseText) as T) : (undefined as T);
}

export async function apiDelete(endpoint: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }
}
