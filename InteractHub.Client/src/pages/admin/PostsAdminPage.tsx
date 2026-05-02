import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { postService } from '../../services/postService';

import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import PostCard from '../../components/admin/PostCard';
import PostDetail from '../../components/admin/PostDetail';
import Post from "../../components/Post";
// ==================== Interface ====================
interface PostResponse {
    Id: number;
    Title?: string;
    Content?: string;
    UserId?: string;
    Status?: number;
    AuthorName?: string;
    AuthorAvatar?: string;
    CreatedAt?: string;
    LikeCount?: number;
    UserLike?: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
    CommentCount?: number;
    Comments: CommentDTO[];


    MediaUrls?: string[];
}
interface CommentDTO {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string | null;
    PostId: number;
    ParentId?: number | null;
    ParentUserName?: string | null;
    Status?: number | null;
    CreatedAt?: string | null;
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentDTO[];
}
interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    countLike: number;
    likes: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
    countComment: number;
    comments: CommentDTO[];
    status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
    createdAt: string;
    mediaUrls?: string[];
}
const BASE_URL = "https://localhost:7069";

const mapComment = (c: CommentDTO): CommentDTO => ({
    Id: c.Id,
    Content: c.Content,
    UserId: c.UserId,
    UserName: c.UserName,
    UserAvatar: c.UserAvatar,
    PostId: c.PostId,
    ParentId: c.ParentId,
    ParentUserName: c.ParentUserName,
    Status: c.Status,
    CreatedAt: c.CreatedAt,
    LikeCount: c.LikeCount,
    IsLikedByCurrentUser: c.IsLikedByCurrentUser,

    // 🔥 QUAN TRỌNG
    Replies: (c.Replies || []).map(mapComment)
});

const mapPost = (p: PostResponse): Post => ({
    id: p.Id?.toString() || "",
    author: p.AuthorName || "Ẩn danh",
    authorAvatar: p.AuthorAvatar
        ? (p.AuthorAvatar.startsWith("http")
            ? p.AuthorAvatar
            : BASE_URL + p.AuthorAvatar)
        : "",
    title: p.Title || "",
    content: p.Content || "",
    countLike: p.LikeCount || 0,

    likes: (p.UserLike || []).map(like => ({
        UserId: like.UserId,
        UserName: like.UserName,
        Avatar: like.Avatar,
        Type: like.Type
    })),

    countComment: p.CommentCount || 0,

    // ✅ FIX CHUẨN
    comments: (p.Comments || []).map(mapComment),

    status:
        p.Status === -1
            ? 'delete'
            : p.Status === 0
                ? 'hidden'
                : p.Status === 1
                    ? 'public'
                    : p.Status === 2
                        ? 'friend'
                        : 'private',

    createdAt: p.CreatedAt
        ? new Date(p.CreatedAt).toLocaleString('vi-VN')
        : "",

    mediaUrls: p.MediaUrls?.map(url =>
        url.startsWith("http") ? url : BASE_URL + url
    ) || []
});

const statusMap = {
    public: 1,
    friend: 2,
    private: 3,
    hidden: 0,
    delete: -1,
};

const PostsAdminPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'public' | 'friend' | 'private' | 'hidden' | 'delete'>('all');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    // ==================== CALL API ====================
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await postService.getAllPostsAdmin();
                const data = res.data;

                const mappedPosts: Post[] = (data || []).map((p: PostResponse) => mapPost(p));

                setPosts(mappedPosts);
            } catch (error) {
                console.error('Lỗi gọi API:', error);
            }
        };

        fetchPosts();
    }, []);

    // ==================== FILTER ====================
    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {

            // tìm kiếm theo title, người đăng, nội dung
            const matchSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());

            const matchFilter =
                filterType === 'all' || post.status === filterType;

            return matchSearch && matchFilter;
        });
    }, [posts, searchQuery, filterType]);

    const friendCount = posts.filter(p => p.status === 'friend').length;
    const privateCount = posts.filter(p => p.status === 'private').length;
    const publicCount = posts.filter(p => p.status === 'public').length;
    const hiddenCount = posts.filter(p => p.status === 'hidden').length;
    const deleteCount = posts.filter(p => p.status === 'delete').length;

    // ==================== ACTION ====================
    const handleChangeStatus = async (
        id: string,
        status: Post['status']
    ) => {
        try {
            await postService.updateStatusPost(
                Number(id),
                statusMap[status]
            );

            // update UI ngay lập tức
            setPosts(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, status } : p
                )
            );

        } catch (error) {
            console.error('Update status failed:', error);
        }
    };

    const handleViewDetail = (id: string) => {
        const found = posts.find(p => p.id === id);
        if (found) setSelectedPost(found);
    };
    // ==================== UI ====================
    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 ml-64">
                <Header />

                <div className="p-6">
                    <div className="bg-white rounded-lg border border-gray-200">

                        {/* SEARCH + FILTER */}
                        <div className="p-6 border-b border-gray-200 mt-10">
                            <div className="flex gap-4">
                                <div className="flex-1 relative ">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bài viết..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="public">Công khai</option>
                                    <option value="friend">Bạn bè</option>
                                    <option value="private">Riêng tư</option>
                                    <option value="hidden">Ẩn</option>
                                    <option value="delete">Xóa</option>
                                </select>
                            </div>

                            <div className="flex gap-6 mt-4 text-sm text-gray-600">
                                <div>Tổng: {posts.length}</div>
                                <div>Công khai : {publicCount}</div>
                                <div>Bạn bè: {friendCount}</div>
                                <div>Riêng tư: {privateCount}</div>
                                <div>Ẩn: {hiddenCount}</div>
                                <div>Xóa: {deleteCount}</div>
                            </div>
                        </div>

                        {/* LIST */}
                        <div className="divide-y">
                            {filteredPosts.map((post) => (
                                <PostCard
                                    key={post.id}  
                                    post={post}
                                    onHide={(id) => handleChangeStatus(id, "hidden")}
                                    onRestore={(id) => handleChangeStatus(id, "private")}
                                    onDelete={(id) => handleChangeStatus(id, "delete")}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAIL MODAL */}
            {selectedPost && (
                <PostDetail
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                />
            )}

        </div>
    );
};

export default PostsAdminPage;