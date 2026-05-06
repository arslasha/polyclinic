const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const doctorsApi = {
  list: () => apiFetch<any[]>("/doctors/"),
  get: (id: number) => apiFetch<any>(`/doctors/${id}/`),
};

export const appointmentsApi = {
  list: () => apiFetch<any[]>("/appointments/"),
  create: (data: any) =>
    apiFetch<any>("/appointments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const slotsApi = {
  list: (params?: { doctor?: number; date?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return apiFetch<any[]>(`/slots/${query}`);
  },
};
