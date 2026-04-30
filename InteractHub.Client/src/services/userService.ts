import axiosInstance from "./axiosInstance";
import { type User, type ProfileUpdateData } from "../schemas/user.schema";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };
interface UserGrowth {
  Year: number;
  Month: number;
  Users: number;
}

interface UserDashboard {
  TotalUsers: number;
  Growth: UserGrowth[];
}
export interface UserSearchResult {
  Id: string;
  Username: string;
  FullName?: string;
  AvatarUrl?: string;
  MutualFriends: number;
  FriendshipStatus: "None" | "Pending" | "Received" | "Friend" | "Blocked";
}
export const userService = {
  getProfileMe: () =>
    axiosInstance
      .get<ApiRes<User>>("/api/users/me")
      .then((res) => ({ ...res, data: res.data.Data })),

  getUserById: (id: string) =>
    axiosInstance
      .get<ApiRes<User>>(`/api/users/${id}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  getProfile: (id?: string) =>
    id ? userService.getUserById(id) : userService.getProfileMe(),

  updateProfile: (data: ProfileUpdateData) =>
    axiosInstance
      .put<ApiRes<User>>("/api/users/update", data)
      .then((res) => ({ ...res, data: res.data.Data })),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post<ApiRes<string>>("/api/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: res.data.Data }));
  },

  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post<ApiRes<string>>("/api/users/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: res.data.Data }));
  },

   searchUsers: (keyword: string, currentUserId?: string) =>
    axiosInstance
      .get<ApiRes<UserSearchResult[]>>("/api/users/search", {
        params: { keyword, currentUserId },
      })
      .then((res) => {
        const data = res.data;
        // Hỗ trợ cả 2 dạng response: wrapped { Data: [...] } và raw array
        return Array.isArray(data) ? data : (data.Data ?? []);
      }),
  // ── QUẢN LÝ NGƯỜI DÙNG (ADMIN) ───────────────────────────────
  getAllUsers: () => {
    // return axiosInstance.get<User[]>("/api/users");

    return axiosInstance
      .get<ApiRes<User[]>>("/api/users")
      .then((res) => ({ ...res, data: res.data.Data }));
  },

  updateUserStatus: (userId: string, newStatus: number) => {
    return axiosInstance
      .put<ApiRes<boolean>>(`/api/users/${userId}/status?newStatus=${newStatus}`)
      .then((res) => ({ ...res, data: res.data.Data }));
  },

  getUsersCount: async () => {
    const res = await axiosInstance .get<ApiRes<UserDashboard>>(
      'api/users/admin/dashboard'
    )
    return res.data.Data;
  }


};