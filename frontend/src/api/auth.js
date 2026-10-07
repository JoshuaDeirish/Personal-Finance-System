import api from "./client";

export const authApi = {
  me: () => api.get("/auth/me/").then((r) => r.data),
  login: ({ email, password, remember }) =>
    api.post("/auth/login/", { email, password, remember }).then((r) => r.data),
  register: (payload) => api.post("/auth/register/", payload).then((r) => r.data),
  logout: () => api.post("/auth/logout/"),
  updateProfile: (changes) => api.patch("/auth/me/", changes).then((r) => r.data),
  changePassword: (payload) => api.post("/auth/password/", payload),
};
