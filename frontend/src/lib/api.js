const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(data?.error || "Request failed", res.status, data);
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  verifyEmail: (payload) => request("/api/auth/verify-email", { method: "POST", body: payload }),
  verifyEmailOtp: (payload) => request("/api/auth/verify-email-otp", { method: "POST", body: payload }),
  resendVerification: (payload) => request("/api/auth/resend-verification", { method: "POST", body: payload }),
  admin2faSetup: (token) => request("/api/auth/admin/2fa/setup", { method: "POST", token }),
  admin2faEnable: (token, payload) => request("/api/auth/admin/2fa/enable", { method: "POST", token, body: payload }),
  adminLoginStart: (payload) => request("/api/auth/admin/login/start", { method: "POST", body: payload }),
  adminLoginVerify: (payload) => request("/api/auth/admin/login/verify", { method: "POST", body: payload }),
  changePassword: (token, payload) => request("/api/auth/change-password", { method: "POST", token, body: payload }),
  forgotPasswordStart: (payload) => request("/api/auth/forgot-password/start", { method: "POST", body: payload }),
  forgotPasswordVerify: (payload) => request("/api/auth/forgot-password/verify", { method: "POST", body: payload }),
  me: (token) => request("/api/auth/me", { token }),

  listEvents: (token) => request("/api/events", { token }),
  createEvent: (token, payload) => request("/api/events", { method: "POST", token, body: payload }),
  updateEvent: (token, id, payload) => request(`/api/events/${id}`, { method: "PUT", token, body: payload }),
  deleteEvent: (token, id) => request(`/api/events/${id}`, { method: "DELETE", token }),

  registerForEvent: (token, id) => request(`/api/events/${id}/register`, { method: "POST", token }),
  runStart: (token, id) => request(`/api/events/${id}/run/start`, { method: "POST", token }),
  runEnd: (token, id) => request(`/api/events/${id}/run/end`, { method: "POST", token }),
  runLatest: (token, id) => request(`/api/events/${id}/run/latest`, { token }),
  leaderboard: (token, id, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/events/${id}/leaderboard${qs ? `?${qs}` : ""}`, { token });
  },

  participants: (token, id) => request(`/api/events/${id}/participants`, { token }),
  analytics: (token, id) => request(`/api/events/${id}/analytics`, { token })
};

export function participantsCsvUrl(eventId) {
  return `${API_BASE_URL}/api/events/${eventId}/participants.csv`;
}

export function participantsXlsxUrl(eventId) {
  return `${API_BASE_URL}/api/events/${eventId}/participants.xlsx`;
}

export function participantsPdfUrl(eventId) {
  return `${API_BASE_URL}/api/events/${eventId}/participants.pdf`;
}
