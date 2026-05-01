import React, { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle } from "lucide-react";
import { adminProfileService } from "../../services/adminService";
import type { AdminUser } from "./adminMockData";

interface Props {
    admin: AdminUser;
}

const SecurityTab: React.FC<Props> = ({ admin }) => {
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [show, setShow] = useState({ current: false, next: false, confirm: false });
    const [errors, setErrors] = useState<Partial<typeof form>>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const strength = (pw: string) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh"];
    const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

    const validate = () => {
        const e: Partial<typeof form> = {};
        if (!form.current) e.current = "Vui lòng nhập mật khẩu hiện tại";
        if (form.next.length < 6) e.next = "Mật khẩu mới phải ít nhất 6 ký tự";
        if (form.next !== form.confirm) e.confirm = "Mật khẩu xác nhận không khớp";
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setErrors({});
        setApiError(null);
        setSaving(true);
        try {
            await adminProfileService.updateProfile({
                userName: admin.fullName,
                phone: admin.phone,
                bio: admin.bio,
                gender: admin.gender,
                dateOfBirth: admin.dateOfBirth,
                currentPassword: form.current,
                newPassword: form.next,
                confirmNewPassword: form.confirm,
            });
            setSuccess(true);
            setForm({ current: "", next: "", confirm: "" });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setApiError(err?.response?.data?.Message ?? "Đổi mật khẩu thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const PasswordField = ({ label, name, placeholder }: {
        label: string; name: keyof typeof form; placeholder?: string;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type={show[name] ? "text" : "password"}
                    value={form[name]} placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                />
                <button type="button"
                    onClick={() => setShow({ ...show, [name]: !show[name] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show[name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    const s = strength(form.next);

    return (
        <div className="space-y-5 max-w-md">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800">Đổi mật khẩu</span>
            </div>

            <PasswordField label="Mật khẩu hiện tại" name="current" placeholder="••••••••" />
            <PasswordField label="Mật khẩu mới" name="next" placeholder="Ít nhất 6 ký tự" />

            {form.next && (
                <div>
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= s ? strengthColor[s] : "bg-gray-200"}`} />
                        ))}
                    </div>
                    <p className={`text-xs font-medium ${s <= 1 ? "text-red-500" : s === 2 ? "text-yellow-500" : s === 3 ? "text-blue-500" : "text-green-600"}`}>
                        Độ mạnh: {strengthLabel[s]}
                    </p>
                </div>
            )}

            <PasswordField label="Xác nhận mật khẩu mới" name="confirm" placeholder="Nhập lại mật khẩu mới" />

            {apiError && <p className="text-sm text-red-500">{apiError}</p>}

            <div className="flex items-center gap-3 pt-1">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-[var(--color-text)] text-sm font-medium rounded-xl transition-all">
                    {saving ? "Đang lưu..." : "Đổi mật khẩu"}
                </button>
                {success && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Đổi mật khẩu thành công
                    </span>
                )}
            </div>
        </div>
    );
};

export default SecurityTab;
