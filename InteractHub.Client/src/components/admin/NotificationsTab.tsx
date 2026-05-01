import React, { useState } from "react";
import { Bell, Mail, Monitor, CheckCircle } from "lucide-react";
import type { NotificationSettings } from "./adminMockData";
import { defaultNotifications } from "./adminMockData";

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-300"}`}
    >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
);

const NotificationsTab: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultNotifications);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const toggle = (key: keyof NotificationSettings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setSaving(true);
        // TODO: gọi API
        setTimeout(() => {
            setSaving(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
        }, 700);
    };

    const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                <Icon className="w-4 h-4 text-blue-500" />
                {title}
            </div>
            {children}
        </div>
    );

    const Row = ({ label, desc, checked, onToggle }: { label: string; desc?: string; checked: boolean; onToggle: () => void }) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-800">{label}</p>
                {desc && <p className="text-xs text-gray-500">{desc}</p>}
            </div>
            <Toggle checked={checked} onChange={onToggle} />
        </div>
    );

    return (
        <div className="space-y-4 max-w-lg">
            <Section icon={Mail} title="Thông báo Email">
                <Row label="Người dùng mới đăng ký" checked={settings.emailNewUser} onToggle={() => toggle("emailNewUser")} />
                <Row label="Có báo cáo vi phạm mới" checked={settings.emailNewReport} onToggle={() => toggle("emailNewReport")} />
                <Row label="Cảnh báo hệ thống" desc="Lỗi server, tấn công, v.v." checked={settings.emailSystemAlert} onToggle={() => toggle("emailSystemAlert")} />
            </Section>

            <Section icon={Monitor} title="Thông báo trình duyệt">
                <Row label="Push notification" desc="Hiện thông báo trực tiếp trên màn hình" checked={settings.browserPush} onToggle={() => toggle("browserPush")} />
            </Section>

            <Section icon={Bell} title="Báo cáo định kỳ">
                <div>
                    <p className="text-sm text-gray-700 mb-2">Tần suất nhận báo cáo tổng hợp</p>
                    <div className="flex gap-2">
                        {(["realtime", "daily", "weekly"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setSettings({ ...settings, reportDigest: v })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${settings.reportDigest === v ? "bg-blue-600 text-[var(--color-text)] border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}
                            >
                                {v === "realtime" ? "Thời gian thực" : v === "daily" ? "Hàng ngày" : "Hàng tuần"}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            <div className="flex items-center gap-3 pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-[var(--color-text)] text-sm font-medium rounded-xl transition-all"
                >
                    {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </button>
                {success && (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Đã lưu
                    </span>
                )}
            </div>
        </div>
    );
};

export default NotificationsTab;
