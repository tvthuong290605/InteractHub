import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    AlertCircle,
    UserCircle
} from "lucide-react";

// ==================== Interface ====================

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const Sidebar: React.FC = () => {
    const location = useLocation();

    const menuItems: MenuItem[] = [
        {
            path: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            path: "/admin/users",
            label: "Quản lý người dùng",
            icon: Users
        },
        {
            path: "/admin/posts",
            label: "Quản lý bài viết",
            icon: FileText
        },
        {
            path: "/admin/reports",
            label: "Quản lý báo cáo",
            icon: AlertCircle
        },
        {
            path: "/admin/profile",
            label: "Thông tin cá nhân",
            icon: UserCircle
        },
    ];

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-700 h-screen fixed left-0 top-0 flex flex-col text-gray-900">
            {/* Header */}
            <div className="p-6 border-b border-gray-300">
                <h1 className="text-2xl font-bold ">Admin Panel</h1>
                <p className="text-sm text-gray-500 mt-1">Mạng xã hội</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-800 hover:bg-blue-100 hover:text-blue-700"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;