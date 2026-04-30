import axiosInstance from "../services/axiosInstance";
import type { AdminUser } from "../components/admin/adminMockData";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

// Payload gửi lên backend (khớp UpdateProfileDto)
export interface UpdateProfilePayload {
    userName: string;
    phone?: string | null;
    bio?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

// Map UserAdminDTO → AdminUser (frontend type)
export const mapDtoToAdminUser = (dto: any): AdminUser => ({
    id: dto.Id ?? dto.id ?? "",
    fullName: dto.Username ?? dto.username ?? "",   // backend dùng Username cho FullName
    email: dto.Email ?? dto.email ?? "",
    phone: dto.Phone ?? dto.phone ?? null,
    role: (dto.Roles ?? dto.roles ?? [])[0] ?? "Admin",
    avatarUrl: dto.AvatarUrl ?? dto.avatarUrl ?? null,
    coverUrl: dto.CoverUrl ?? dto.coverUrl ?? null,
    joinedAt: dto.CreatedAt ?? dto.createdAt ?? new Date().toISOString(),
    bio: dto.Bio ?? dto.bio ?? null,
    gender: dto.Gender ?? dto.gender ?? null,
    dateOfBirth: dto.DateOfBirth ?? dto.dateOfBirth ?? null,
    status: dto.Status ?? dto.status ?? 1,
});

export const adminProfileService = {
    // Lấy thông tin admin đang đăng nhập
    getMe: async (): Promise<AdminUser> => {
        const res = await axiosInstance.get<ApiRes<any>>("/api/users/me");
        return mapDtoToAdminUser(res.data.Data);
    },

    // Cập nhật thông tin cơ bản
    updateProfile: async (payload: UpdateProfilePayload): Promise<AdminUser> => {
        const res = await axiosInstance.put<ApiRes<any>>("/api/users/update", payload);
        return mapDtoToAdminUser(res.data.Data);
    },

    // Upload avatar → trả về URL
    uploadAvatar: async (file: File): Promise<string> => {
        const form = new FormData();
        form.append("file", file);
        const res = await axiosInstance.post<ApiRes<string>>("/api/users/upload-avatar", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.Data;
    },

    // Upload cover → trả về URL
    uploadCover: async (file: File): Promise<string> => {
        const form = new FormData();
        form.append("file", file);
        const res = await axiosInstance.post<ApiRes<string>>("/api/users/upload-cover", form, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.Data;
    },
};
