export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    joinedAt: string;
    bio: string;
}

export interface NotificationSettings {
    emailNewUser: boolean;
    emailNewReport: boolean;
    emailSystemAlert: boolean;
    browserPush: boolean;
    reportDigest: "realtime" | "daily" | "weekly";
}

export interface Preferences {
    language: "vi" | "en";
    theme: "light" | "dark" | "system";
    timezone: string;
    dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
    compactMode: boolean;
}

export const mockAdmin: AdminUser = {
    id: "admin-001",
    fullName: "Admin User",
    email: "admin@example.com",
    phone: "0901234567",
    role: "Super Administrator",
    avatarUrl: null,
    coverUrl: null,
    joinedAt: "2024-01-01",
    bio: "Quản trị viên hệ thống InteractHub",
};

export const mockNotifications: NotificationSettings = {
    emailNewUser: true,
    emailNewReport: true,
    emailSystemAlert: false,
    browserPush: true,
    reportDigest: "daily",
};

export const mockPreferences: Preferences = {
    language: "vi",
    theme: "light",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/mm/yyyy",
    compactMode: false,
};
