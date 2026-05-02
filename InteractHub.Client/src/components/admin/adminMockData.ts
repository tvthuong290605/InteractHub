// Khớp với UserAdminDTO từ backend
export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: string;
    avatarUrl: string | null;
    coverUrl: string | null;
    joinedAt: string;
    bio: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    status: number;
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

export const defaultNotifications: NotificationSettings = {
    emailNewUser: true,
    emailNewReport: true,
    emailSystemAlert: false,
    browserPush: true,
    reportDigest: "daily",
};

export const defaultPreferences: Preferences = {
    language: "vi",
    theme: "light",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/mm/yyyy",
    compactMode: false,
};
