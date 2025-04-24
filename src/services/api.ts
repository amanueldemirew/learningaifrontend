import axios from "axios";
import { UserUpdate, UserResponse } from "@/types/user";

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  signup: async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/signup", {
      username,
      email,
      password,
    });
    return response.data;
  },
  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Courses API
export const coursesApi = {
  getAll: async () => {
    const response = await api.get("/courses");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  create: async (data: Record<string, unknown>) => {
    const response = await api.post("/courses", data);
    return response.data;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
  publish: async (id: string) => {
    const response = await api.post(`/courses/${id}/publish`);
    return response.data;
  },
};

// Units API
export const unitsApi = {
  getAll: async (courseId: string) => {
    const response = await api.get(`/courses/${courseId}/units`);
    return response.data;
  },
  getById: async (courseId: string, unitId: string) => {
    const response = await api.get(`/courses/${courseId}/units/${unitId}`);
    return response.data;
  },
  create: async (courseId: string, data: Record<string, unknown>) => {
    const response = await api.post(`/courses/${courseId}/units`, data);
    return response.data;
  },
  update: async (
    courseId: string,
    unitId: string,
    data: Record<string, unknown>
  ) => {
    const response = await api.put(
      `/courses/${courseId}/units/${unitId}`,
      data
    );
    return response.data;
  },
  delete: async (courseId: string, unitId: string) => {
    const response = await api.delete(`/courses/${courseId}/units/${unitId}`);
    return response.data;
  },
};

// User API
export const userApi = {
  getMe: async (): Promise<UserResponse> => {
    const response = await api.get("/users/me");
    return response.data;
  },
  updateMe: async (data: UserUpdate): Promise<UserResponse> => {
    const response = await api.put("/users/me", data);
    return response.data;
  },
  uploadProfilePhoto: async (file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/users/me/profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getProfilePhoto: async (): Promise<string> => {
    const response = await api.get("/users/me/profile-photo", {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<UserResponse> => {
    const response = await api.post("/users/me/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

export default api;
