import React, { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import type { AdminUser } from "./adminMockData";
import { adminProfileService } from "../../services/adminService";

interface Props {
    admin: AdminUser;
    onChange: (updated: Partial<AdminUser>) => void;
}

const ProfileInfoTab: React.FC<Props> = ({ admin, onChange }) => {
    const [form, setForm] = useState({
        fullName: admin.fullName ?? "",
        email: admin.email ?? "",
        phone: admin.phone ?? "",
        bio: admin.bio ?? "",
        gender: admin.gender ?? "",
        dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.slice(0, 10) : "",
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    const validate = () => {
        const e: Partial<Record<keyof typeof form, string>> = {};
        if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
        if (form.phone && !/^[0-9]{10,11}$/.test(form.phone))
            e.phone = "Số điện thoại không hợp lệ";
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setApiError(null);
        setSaving(true);
        try {
            const updated = await adminProfileService.updateProfile({
                userName: form.fullName,
                phone: form.phone || null,
                bio: form.bio || null,
                gender: form.gender || null,
                dateOfBirth: form.dateOfBirth || null,
                avatarUrl: admin.avatarUrl,
                coverUrl: admin.coverUrl,
            });
            onChange(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
        } catch (err: any) {
            setApiError(err?.response?.data?.Message ?? "Lưu thất bại, vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    const Field = ({ label, name, type = "text", placeholder, rows }: {
        label: string; name: keyof typeof form; type?: string; placeholder?: string; rows?: number;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {rows ? (
                <textarea rows={rows} value={form[name] ?? ""} placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
            ) : (
                <input type={type} value={form[name] ?? ""} placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
            )}
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Họ và tên" name="fullName" placeholder="Nhập họ tên" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email" value={form.email} disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email không thể thay đổi</p>
                </div>
                <Field label="Số điện thoại" name="phone" placeholder="0901234567" />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <select value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Chọn giới tính --</option>
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                    </select>
                </div>
                <Field label="Ngày sinh" name="dateOfBirth" type="date" />
            </div>
            <Field label="Giới thiệu" name="bio" rows={3} placeholder="Mô tả ngắn về bản thân..." />

            {apiError && <p className="text-sm text-red-500">{apiError}</p>}

            <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-[var(--color-text)] text-sm font-medium rounded-xl transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                {success && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Đã lưu thành công
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProfileInfoTab;
