import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// ==================== Interface ====================

interface PostActivityData {
    month: string;           // Tháng 2, tháng 3 ......
    posts: number;
    comments: number;
    likes: number;
}

interface PostActivityChartProps {
    data: PostActivityData[];
}

// ==================== Component ====================

const PostActivityChart: React.FC<PostActivityChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Hoạt động bài viết trong năm</h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, (dataMax) => Math.ceil(dataMax * 1.6)]}/>
                    <Tooltip cursor={{ fill: "rgba(59, 131, 246, 0.07)" }}/> 

                    <Bar dataKey="posts" fill="#3b82f6" name="Bài viết" />
                    <Bar dataKey="comments" fill="#10b981" name="Bình luận" />
                    <Bar dataKey="likes" fill="#f59e0b" name="Lượt thích" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PostActivityChart;

//  <Tooltip cursor={false}/>  :: bỏ màu xám(mặc định) khi hover