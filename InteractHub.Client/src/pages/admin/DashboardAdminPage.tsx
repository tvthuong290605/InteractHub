
import React, { useEffect, useState } from "react";

// Import các component con
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { postService } from "../../services/postService";
import { userService } from "../../services/userService";
import { hashtagService } from "../../services/hashtagService";

import StatsCards from "../../components/admin/StatsCards";
import UserGrowthChart from "../../components/admin/UserGrowthChart";
import ReportPieChart from "../../components/admin/ReportPieChart";
import PostActivityChart from "../../components/admin/PostActivityChart";
import RecentHashtags from "../../components/admin/RecentHashtags";

// Import icon
import { Users, FileText, AlertCircle, Hash } from "lucide-react";

// ==================== Interfaces ====================

interface StatItem {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    path: string;

}

interface GrowthData {
    year: number;
    month: number;
    users: number;
}

interface ReportData {
    name: string;
    value: number;
    color: string;
}

interface PostActivityData {
    month: string;
    posts: number;
    comments: number;
    likes: number;
}

interface HashtagItem {
    Name: string;
    Count: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<StatItem[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<GrowthData[]>([]);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [postActivityData, setPostActivityData] = useState<PostActivityData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [hashtags, setHashtags] = useState<HashtagItem[]>([]);

    useEffect(() => {
        //Gọi api
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                /*----- Nhận data user từ api -----*/
                const dataUser = await userService.getUsersCount();

                const userCount = dataUser.TotalUsers;

                const currentYear =
                    dataUser.Growth && dataUser.Growth.length > 0
                        ? dataUser.Growth[0].Year
                        : new Date().getFullYear();

                const fullMonthsUser: GrowthData[] = Array.from({ length: 12 }, (_, i) => ({
                    year: currentYear,
                    month: i + 1,
                    users: 0
                }));

                const apiGrowth = dataUser.Growth || [];

                apiGrowth.forEach((g: any) => {
                    const index = g.Month - 1;

                    if (index >= 0 && index < 12) {
                        fullMonthsUser[index] = {
                            year: g.Year,
                            month: g.Month,
                            users: g.Users
                        };
                    }
                });

                /* ----- Nhận data post từ api -----*/
                const dataPost = await postService.getPostCount();
                const postCount = dataPost.TotalPosts;
                // xử lý chia đề ra 12 cố định, nếu tháng không có thì để 0
                const fullMonths: PostActivityData[] = Array.from({ length: 12 }, (_, i) => ({
                    month: `Th_${i + 1}`,
                    posts: 0,
                    comments: 0,
                    likes: 0
                }));
                const apiData = dataPost.Activity || [];

                apiData.forEach((item: any) => {
                    const monthIndex = Number(item.Month) - 1;

                    if (monthIndex >= 0 && monthIndex < 12) {
                        fullMonths[monthIndex] = {
                            month: `T${item.Month}`,
                            posts: item.Posts,
                            comments: item.Comments,
                            likes: item.Likes
                        };
                    }
                });

                /* ----------Nhận data report từ API */

                const dataReport = await postService.getPostReportCount();

                const reportCount = dataReport.TotalReport;
                const colors = ["#ef4444", "#eab308", "#f97316", "#22c55e", "#3b82f6"];

                const pieData: ReportData[] = (dataReport.PostReports || []).map(
                    (item: any, index: number) => ({
                        name: item.Reason,
                        value: item.Count,
                        color: colors[index % colors.length],
                    }));

                //count hashtag
                const hashtagCount = await hashtagService.getHashtagCount();

                const hashtagData = await hashtagService.getHashtagWithCount();
                const formattedHashtags = hashtagData.map((item: any) => ({
                    Name: item.Name,
                    Count: item.Count
                }));

                // Dữ liệu cho StatsCards
                const statsData: StatItem[] = [
                    {
                        title: "Users",
                        value: userCount,
                        icon: Users,
                        color: "bg-blue-500",
                        path: "/admin/users"
                    },
                    {
                        title: "Posts",
                        value: postCount,
                        icon: FileText,
                        color: "bg-green-500",
                        path: "/admin/posts"
                    },
                    {
                        title: "Reports",
                        value: reportCount,
                        icon: AlertCircle,
                        color: "bg-red-500",
                        path: "/admin/reports"
                    },
                    {
                        title: "Hastags",
                        value: hashtagCount,
                        icon: Hash,
                        color: "bg-purple-500",
                        path: ""
                    },
                ];
                setStats(statsData);
                setUserGrowthData(fullMonthsUser);
                setReportData(pieData);
                setPostActivityData(fullMonths);
                setHashtags(formattedHashtags);
            }
            catch (err) {
                console.error("Lỗi dashboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hiển thị loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1877f2] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <Sidebar />

            <div className="flex-1 ml-64">   {/* ml-64 = chiều rộng của Sidebar (w-64) */}
                <Header />

                <div className="p-16 p-6">
                    <div className="space-y-6">
                        {/* Thống kê tổng quan */}
                        <StatsCards stats={stats} />

                        <UserGrowthChart data={userGrowthData} />

                        <PostActivityChart data={postActivityData} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReportPieChart data={reportData} />
                            <RecentHashtags hashtags={hashtags} />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;