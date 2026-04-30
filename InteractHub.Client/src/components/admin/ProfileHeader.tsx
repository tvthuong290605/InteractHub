import React, { useRef, useState } from "react";
import { Camera, Mail, Calendar, Shield, Pencil } from "lucide-react";
import type { AdminUser } from "./adminMockData";
import { adminProfileService } from "../../services/adminService";

interface Props {
    admin: AdminUser;
    onChange: (updated: Partial<AdminUser>) => void;
}

const ProfileHeader: React.FC<Props> = ({ admin, onChange }) => {
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(admin.avatarUrl);
    const [coverPreview, setCoverPreview] = useState<string | null>(admin.coverUrl);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "avatar" | "cover"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview ngay
        const previewUrl = URL.createObjectURL(file);
        if (type === "avatar") setAvatarPreview(previewUrl);
        else setCoverPreview(previewUrl);

        setUploading(true);
        setError(null);
        try {
            const uploadedUrl = type === "avatar"
                ? await adminProfileService.uploadAvatar(file)
                : await adminProfileService.uploadCover(file);

            onChange(type === "avatar" ? { avatarUrl: uploadedUrl } : { coverUrl: uploadedUrl });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError("Upload thất bại, vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    const initials = (admin.fullName || "A")
        .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const BASE = "https://localhost:7069";
    const avatarSrc = avatarPreview
        ? (avatarPreview.startsWith("blob:") ? avatarPreview : `${BASE}${avatarPreview}`)
        : null;
    const coverSrc = coverPreview
        ? (coverPreview.startsWith("blob:") ? coverPreview : `${BASE}${coverPreview}`)
        : null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Ảnh bìa */}
            <div
                className="h-40 relative bg-gradient-to-r from-blue-500 to-indigo-600"
                style={coverSrc ? { backgroundImage: `url(${coverSrc})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            >
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageChange(e, "cover")} />
                <button onClick={() => coverInputRef.current?.click()}
                    className="absolute bottom-3 right-4 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 backdrop-blur-sm transition-all">
                    <Camera className="w-4 h-4" />
                    {uploading ? "Đang upload..." : "Đổi ảnh bìa"}
                </button>
            </div>

            {/* Avatar + Info */}
            <div className="px-6 pb-6">
                <div className="flex items-end gap-5 -mt-14 mb-5">
                    <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            {avatarSrc
                                ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                                : <span className="text-white text-3xl font-bold">{initials}</span>
                            }
                        </div>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleImageChange(e, "avatar")} />
                        <button onClick={() => avatarInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full border-2 border-white flex items-center justify-center shadow transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-2xl font-bold text-gray-900">{admin.fullName}</h3>
                            {uploading && <span className="text-xs text-blue-500 animate-pulse">Đang upload...</span>}
                            {saved && <span className="text-xs text-green-500">✓ Đã lưu</span>}
                            {error && <span className="text-xs text-red-500">{error}</span>}
                        </div>
                        <p className="text-gray-500 flex items-center gap-1.5 mt-0.5 text-sm">
                            <Shield className="w-4 h-4 text-blue-500" />
                            {admin.role}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />{admin.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Tham gia {new Date(admin.joinedAt).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
