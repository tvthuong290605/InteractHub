import React from 'react';
import { Search } from 'lucide-react';

interface ReportFilters {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterType: string;
    setFilterType: (type: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    totalReports: number;
    pendingCount: number;
}

const ReportFilters: React.FC<ReportFilters> = ({
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    totalReports,
    pendingCount,
}) => {
    return (
        <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col gap-4">
                {/* Thanh tìm kiếm + bộ lọc */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo nội dung báo cáo, người báo cáo hoặc người bị báo cáo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả loại</option>
                        <option value="Spam">Spam</option>
                        <option value="Quấy rối">Quấy rối</option>
                        <option value="Ảnh nhạy cảm">Ảnh nhạy cảm</option>
                        <option value="Bạo lực">Bạo lực</option>
                        <option value="Ngôn từ thù ghét">Ngôn từ thù ghét</option>
                        <option value="Vấn đề khác">Khác</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="finished">Đã xử lý</option>
                        <option value="refuse">Đã từ chối</option>
                    </select>
                </div>

                {/* Thống kê nhanh */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                        <span className="font-medium">Tổng:</span>{' '}
                        <span className="font-semibold">{totalReports}</span> reports
                    </div>
                    <div>
                        <span className="font-medium">Chờ xử lý:</span>{' '}
                        <span className="text-yellow-600 font-semibold">{pendingCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;