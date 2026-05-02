import React from "react";
import ProfileInfoTab from "./ProfileInfoTab";
import SecurityTab from "./SecurityTab";
import NotificationsTab from "./NotificationsTab";
import PreferencesTab from "./PreferencesTab";
import type { AdminUser } from "./adminMockData";

interface Props {
    activeTab: string;
    admin: AdminUser;
    onAdminChange: (updated: Partial<AdminUser>) => void;
}

const ProfileTabContent: React.FC<Props> = ({ activeTab, admin, onAdminChange }) => {
    switch (activeTab) {
        case "profile":
            return <ProfileInfoTab admin={admin} onChange={onAdminChange} />;
        case "security":
            return <SecurityTab admin={admin} />;
        case "notifications":
            return <NotificationsTab />;
        case "preferences":
            return <PreferencesTab />;
        default:
            return <ProfileInfoTab admin={admin} onChange={onAdminChange} />;
    }
};

export default ProfileTabContent;
