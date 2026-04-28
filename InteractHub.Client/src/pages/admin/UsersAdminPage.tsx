import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import UserRow from '../../components/admin/UserRow';
import UserDetailModal from '../../components/admin/UserDetailModal';
import { userService } from '../../services/userService';

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
const BASE_URL = "https://localhost:7069";

const UsersAdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // ✅ GỌI API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await userService.getAllUsers();
                const data = res.data;
                console.log("DATA API:", res.data);

                const mappedUsers: User[] = data.map((u: any) => ({
                    id: u.Id,
                    name: u.Username,
                    email: u.Email || "Chưa có",
                    gender: u.Gender || "Chưa có",
                    phone: u.Phone || "Chưa có",
                    dateOfBirth: u.DateOfBirth || "Chưa có",
                    avatar: u.AvatarUrl
                        ? BASE_URL + u.AvatarUrl
                        : "",
                    status: u.Status === 1 ? 'active' : u.Status === 2 ? 'suspended' : 'banned',
                    posts: u.PostCount || 0,
                    friends: 0, // API chưa có trường này, tạm để 0
                    createdAt: u.CreatedAt
                        ? new Date(u.CreatedAt).toLocaleDateString("vi-VN")
                        : "",

                }));
                console.log("MAPPED:", mappedUsers);
                setUsers(mappedUsers);

            } catch (error) {
                console.error("Lỗi gọi API:", error);
            }
        };

        fetchUsers();
    }, []);

    // ✅ FILTER
    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const name = user.name || "";
            const email = user.email || "";

            const matchSearch =
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchFilter =
                filterStatus === 'all' || user.status === filterStatus;

            return matchSearch && matchFilter;
        });
    }, [users, searchQuery, filterStatus]);


    // ✅ COUNT
    const activeCount = users.filter(u => u.status === 'active').length;
    const suspendedCount = users.filter(u => u.status === 'suspended').length;

    const handleViewDetail = (id: string) => {
        const user = users.find(u => u.id === id);
        if (user) {
            setSelectedUser(user);
            setIsDetailOpen(true);
        }
    };

    const handleSuspend = async (id: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const isSuspended = user.status === 'suspended';

        const confirmMessage = isSuspended
            ? "Người dùng đang bị KHÓA. Bạn có muốn MỞ KHÓA không?"
            : "Bạn có chắc muốn KHÓA người dùng này?";

        const confirm = window.confirm(confirmMessage);
        if (!confirm) return;

        try {
            const newStatus = isSuspended ? 1 : 2; // 1 = active, 2 = suspended

            await userService.updateUserStatus(id, newStatus);

            setUsers(prev =>
                prev.map(u =>
                    u.id === id
                        ? { ...u, status: isSuspended ? 'active' : 'suspended' }
                        : u
                )
            );

        } catch (error) {
            console.error(error);
        }
    };

    const handleBan = async (id: string) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        const isBanned = user.status === 'banned';

        const confirmMessage = isBanned
            ? "Người dùng đang bị BAN. Bạn có muốn GỠ BAN không?"
            : "Bạn có chắc muốn BAN người dùng này?";

        const confirm = window.confirm(confirmMessage);
        if (!confirm) return;

        try {
            const newStatus = isBanned ? 1 : 3; // 1 = active, 3 = banned

            await userService.updateUserStatus(id, newStatus);

            setUsers(prev =>
                prev.map(u =>
                    u.id === id
                        ? { ...u, status: isBanned ? 'active' : 'banned' }
                        : u
                )
            );

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <Header />
            <div className="flex-1 ml-64">
                <Sidebar />
                <div className="p-16 p-6">

                    <div className="bg-white rounded-lg border border-gray-200">

                        {/* SEARCH + FILTER */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    />
                                </div>

                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="suspended">Đã khóa</option>
                                    <option value="banned">Đã cấm</option>
                                </select>
                            </div>

                            <div className="flex gap-4 mt-4 text-sm">
                                <div>Tổng: {users.length}</div>
                                <div>Hoạt động: {activeCount}</div>
                                <div>Đã khóa: {suspendedCount}</div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Email</th>
                                    <th>Giới tính</th>
                                    <th>SĐT</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Chức năng</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredUsers.map((user) => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onViewDetail={handleViewDetail}
                                        //onSendEmail={handleSendEmail}
                                        onSuspend={handleSuspend}
                                        onBan={handleBan}
                                    />
                                ))}
                            </tbody>
                        </table>
                        <UserDetailModal

                            user={selectedUser}
                            open={isDetailOpen}
                            onOpenChange={setIsDetailOpen}
                        />

                        {/* FOOTER */}
                        <div className="p-4 text-sm">
                            Hiển thị {filteredUsers.length} / {users.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );




};

export default UsersAdminPage;