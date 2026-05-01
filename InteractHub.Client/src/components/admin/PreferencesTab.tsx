import React, { useState } from "react";
import { Settings, CheckCircle } from "lucide-react";
import type { Preferences } from "./adminMockData";
import { defaultPreferences } from "./adminMockData";

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-gray-300"}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
);

const PreferencesTab: React.FC = () => {
    const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = () => {
        setSaving(true);
        // TODO: gọi API + apply theme
        if (prefs.theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        setTimeout(() => {
            setSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
        }, 700);
    };

    const Select = ({ label, value, options, onChange }: {
        label: string;
        value: string;
        options: { value: string; label: string }[];
        onChange: (v: string) => void;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );

    const ChipGroup = ({ label, value, options, onChange }: {
        label: string; value: string;
        options: { value: string; label: string }[];
        onChange: (v: string) => void;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                    <button
                        key={o.value}
                        onClick={() => onChange(o.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${value === o.value ? "bg-blue-600 text-[var(--color-text)] border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
                    >
                        {o.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-5 max-w-lg">
            <div className="flex items-center gap-2 mb-1">
                <Settings className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800">Tùy chọn giao diện & hệ thống</span>
            </div>

            <ChipGroup
                label="Ngôn ngữ"
                value={prefs.language}
                options={[{ value: "vi", label: "🇻🇳 Tiếng Việt" }, { value: "en", label: "🇺🇸 English" }]}
                onChange={(v) => setPrefs({ ...prefs, language: v as Preferences["language"] })}
            />

            <ChipGroup
                label="Giao diện"
                value={prefs.theme}
                options={[
                    { value: "light", label: "☀️ Sáng" },
                    { value: "dark", label: "🌙 Tối" },
                    { value: "system", label: "💻 Theo hệ thống" },
                ]}
                onChange={(v) => setPrefs({ ...prefs, theme: v as Preferences["theme"] })}
            />

            <Select
                label="Múi giờ"
                value={prefs.timezone}
                options={[
                    { value: "Asia/Ho_Chi_Minh", label: "GMT+7 — Hồ Chí Minh" },
                    { value: "Asia/Bangkok", label: "GMT+7 — Bangkok" },
                    { value: "Asia/Singapore", label: "GMT+8 — Singapore" },
                    { value: "UTC", label: "UTC" },
                ]}
                onChange={(v) => setPrefs({ ...prefs, timezone: v })}
            />

            <ChipGroup
                label="Định dạng ngày"
                value={prefs.dateFormat}
                options={[
                    { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
                    { value: "mm/dd/yyyy", label: "MM/DD/YYYY" },
                    { value: "yyyy-mm-dd", label: "YYYY-MM-DD" },
                ]}
                onChange={(v) => setPrefs({ ...prefs, dateFormat: v as Preferences["dateFormat"] })}
            />

            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
                <div>
                    <p className="text-sm font-medium text-gray-800">Chế độ gọn</p>
                    <p className="text-xs text-gray-500">Thu nhỏ khoảng cách, hiện nhiều nội dung hơn</p>
                </div>
                <Toggle checked={prefs.compactMode} onChange={() => setPrefs({ ...prefs, compactMode: !prefs.compactMode })} />
            </div>

            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-[var(--color-text)] text-sm font-medium rounded-xl transition-all"
                >
                    {saving ? "Đang lưu..." : "Lưu tùy chọn"}
                </button>
                {success && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Đã áp dụng
                    </span>
                )}
            </div>
        </div>
    );
};

export default PreferencesTab;
