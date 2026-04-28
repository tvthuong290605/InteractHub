import React from 'react';
import StatusBadge from './StatusBadge';
import UserActions from './UserActions';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    avatar: string;
    status: "active" | "suspended" | "banned";
    createdAt: string;
}

interface UserRow {
    user: User;
    onViewDetail: (id: string) => void;
    //onSendEmail: (id: string) => void;
    onSuspend: (id: string) => void;
    onBan: (id: string) => void;
}

const UserRow: React.FC<UserRow> = ({ user, onViewDetail, onSuspend, onBan }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.gender}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.phone}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={user.status} type="user" />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.createdAt}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <UserActions
                    userId={user.id}
                    onViewDetail={onViewDetail}
                    //onSendEmail={onSendEmail}
                    onSuspend={onSuspend}
                    onBan={onBan}
                />
            </td>
        </tr>
    );
};

export default UserRow;