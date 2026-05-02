import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ProfileHeader from '../../components/admin/ProfileHeader';
import ProfileTabs from '../../components/admin/ProfileTabs';
import ProfileTabContent from '../../components/admin/ProfileTabContent';
import { adminProfileService } from '../../services/adminService';
import type { AdminUser } from '../../components/admin/adminMockData';

const ProfileAdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        adminProfileService.getMe()
            .then(setAdmin)
            .catch(() => setError("Không thể tải thông tin. Vui lòng thử lại."))
            .finally(() => setLoading(false));
    }, []);

    const handleAdminChange = (updated: Partial<AdminUser>) => {
        setAdmin((prev) => prev ? { ...prev, ...updated } : prev);
    };

    return (
        <div className="space-y-6 mx-1 my-4">
            <Header />
            <div className="flex-1 ml-64">
                <Sidebar />
                <div className="p-6">
                    {loading && (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center py-10">{error}</div>
                    )}

                    {!loading && !error && admin && (
                        <>
                            <ProfileHeader admin={admin} onChange={handleAdminChange} />
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                                <ProfileTabContent
                                    activeTab={activeTab}
                                    admin={admin}
                                    onAdminChange={handleAdminChange}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileAdminPage;
