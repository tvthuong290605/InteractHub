
import React, { useState } from 'react';

import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ProfileHeader from '../../components/admin/ProfileHeader';
import ProfileTabs from '../../components/admin/ProfileTabs';
import ProfileTabContent from '../../components/admin/ProfileTabContent';

const ProfileAdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

    return (
        <div className="space-y-6 mx-1 my-4">
            <Header />
            <div className="flex-1 ml-64" >
                <Sidebar />
                <div className="p-16 p-6">
                    <ProfileHeader />

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <ProfileTabContent activeTab={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileAdminPage;