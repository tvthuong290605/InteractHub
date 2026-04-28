import React from "react";
import { useEffect } from "react";
import {
    Mail,
    User,
    CheckCircle,
    XCircle,
    Phone,
    Calendar,
    FileText,
    Users,
} from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    avatar: string;
    status: "active" | "suspended" | "banned";
    posts: number;
    friends: number;
    createdAt: string;
}

interface Props {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusConfig = {
    active: {
        label: "Hoạt động",
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
    },
    suspended: {
        label: "Tạm khóa",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: <XCircle className="w-4 h-4 text-yellow-600" />,
    },
    banned: {
        label: "Bị cấm",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <XCircle className="w-4 h-4 text-red-600" />,
    },
};


export const UserDetailModal: React.FC<Props> = ({
    user,
    open,
    onOpenChange,
}) => {
    if (!open || !user) return null;

    const status = statusConfig[user.status];

    // Khi modal mở, khóa scroll của body để tránh bị cuộn trang khi xem chi tiết
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50 p-4"
            onClick={() => onOpenChange(false)} // Cho phép click ra ngoài để đóng modal
        >
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 relative"
                onClick={(e) => e.stopPropagation()} // chặn click vào nội dung bên dưới
            >

                {/* CLOSE */}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-black text-xl"
                >
                    ✕
                </button>

                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500 text-sm">{user.email}</p>

                        <div
                            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 text-xs font-medium border rounded-full ${status.color}`}
                        >
                            {status.icon}
                            {status.label}
                        </div>
                    </div>
                </div>

                <hr className="my-6" />

                {/* GRID */}
                <div className="grid grid-cols-2 gap-6">

                    <div className="space-y-5">
                        <Info icon={<Mail />} label="Email" value={user.email} />
                        <Info icon={<User />} label="Giới tính" value={user.gender} />
                        <Info icon={<Phone />} label="SĐT" value={user.phone} />
                        <Info icon={<Calendar />} label="Ngày sinh" value={user.dateOfBirth} />
                    </div>

                    <div className="space-y-5">
                        <Info icon={<FileText />} label="Bài viết" value={user.posts} />
                        <Info icon={<Users />} label="Bạn bè" value={user.friends} />
                        <Info icon={<Calendar />} label="Ngày tạo" value={user.createdAt} />

                        {/* STATUS BOX */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
                                {status.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Trạng thái</p>
                                <p className="font-medium">{status.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER INFO */}
                <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-gray-600">Posts</p>
                        <p className="font-semibold">{user.posts}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-gray-600">Friends</p>
                        <p className="font-semibold">{user.friends}</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-gray-600">Join</p>
                        <p className="font-semibold">{user.createdAt}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ===== INFO COMPONENT ===== */
const Info = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
}) => {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                {icon}
            </div>

            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
            </div>
        </div>
    );
};

export default UserDetailModal;