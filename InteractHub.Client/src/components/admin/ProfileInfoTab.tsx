import React, { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import type { AdminUser } from "./adminMockData";

interface Props {
    admin: AdminUser;
    onChange: (updated: Partial<AdminUser>) => void;
}

const ProfileInfoTab: React.FC<Props> = ({ admin, onChange }) => {
    const [form, setForm] = useState({
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phone,
        bio: admin.bio,
    });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const validate = () => {
        const e: Partial<typeof form> = {};
        if (!form.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            e.email = "Email không hợp lệ";
        if (form.phone && !/^[0-9]{10,11}$/.test(form.phone))
            e.phone = "Số điện thoại không hợp lệ";
        return e;
    };

    const handleSave = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setSaving(true);
        // TODO: gọi API thật ở đây
        setTimeout(() => {
            onChange(form);
            setSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
        }, 800);
    };

    const Field = ({
        label, name, type = "text", placeholder, rows,
    }: {
        label: string; name: keyof typeof form; type?: string; placeholder?: string; rows?: number;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {rows ? (
                <textarea
                    rows={rows}
                    value={form[name]}
                    placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
            ) : (
                <input
                    type={type}
                    value={form[name]}
                    placeholder={placeholder}
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
                <Field label="Email" name="email" type="email" placeholder="admin@example.com" />
                <Field label="Số điện thoại" name="phone" placeholder="0901234567" />
            </div>
            <Field label="Giới thiệu" name="bio" rows={3} placeholder="Mô tả ngắn về bản thân..." />

            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-all"
                >
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
