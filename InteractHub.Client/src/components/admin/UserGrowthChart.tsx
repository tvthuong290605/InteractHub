import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthData {
    year: number;
    month: number;        // Ví dụ: "2026-01"
    users: number;        // Số lượng người dùng
}

interface UserGrowthChartProps {
    data: GrowthData[];   // Mảng dữ liệu tăng trưởng
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Tăng trưởng người dùng năm {data[0]?.year}</h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.6)]} /> 
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;

// tùy chỉnh độ cao biểu đồ bằng    <YAxis/> : mặc định 