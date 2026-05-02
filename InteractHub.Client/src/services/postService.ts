import { get } from "react-hook-form";
import axiosInstance from "./axiosInstance";

// ── 1. Interface BE (PascalCase - Khớp với C# PostResponseDto) ──

// dùng generic để format dữ liệu API trả về, tái sử dụng cho nhiều kiểu trả về T
type ApiRes<T> = { Success: boolean; Message: string; Data: T };

interface PostResponseDto {
  Id: number;
  Title?: string;
  Content?: string;
  UserId?: string;
  Status?: number;
  AuthorName?: string;
  AuthorAvatar?: string;
  CreatedAt?: string;
  MediaUrls: string[];
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

interface PostAdminDto {
  Id: number;
  Title?: string;
  Content?: string;
  UserId?: string;
  Status?: number;

  AuthorName?: string;
  AuthorAvatar?: string;
  CreatedAt?: string;

  LikeCount: number;
  UserLike: {
    UserId: string;
    UserName: string;
    Avatar: string;
    Type?: string;
  }[];

  CommentCount: number;
  Comments: CommentDTO[];

  MediaUrls: string[];
}
interface PostReportAdminDTO {
  Id: number;
  PostId: number;
  UserId: string;
  UserName: string;
  Type: string;
  Content: string;
  Status: number;
  CreatedAt: string;
  ResolvedAt: string;
  AdminNote: string;
  Post: PostAdminDto;

}

interface PostActivityStatDTO {
  Month: string;
  Posts: number
  Comments: number
  Likes: number
}

interface PostDashboardDTO {
  TotalPosts: number
  Activity: PostActivityStatDTO[]

}

interface PostReportDTO {
  Reason: string
  Count: number
}

interface PostReportDashboardDTO {
  TotalReport: number
  PostReports: PostReportDTO[]
}
// ── 3. Interface FE (camelCase) ──────────────────────────────────
export interface PostItem {
  id: number;
  title?: string;
  content?: string;
  userId?: string;
  status?: number;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  mediaUrls: string[];
}

export interface PostReportItem {
  id: number;
  postId: number;
  userId: string;
  userName: string;
  reason: string;
  status: number;
  createdAt: string;
}

export interface PostReportRequest {
  postId: number;
  reason: string;
}
export interface PostAdminItem {
  id: number;
  author: string;
  authorAvatar?: string;
  title?: string;
  content?: string;

  countLike: number;
  likes: { userId: string; userName: string }[];

  countComment: number;
  comments: {
    id: number;
    author: string;
    content: string;
    createdAt: string;
  }[];

  status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
  createdAt?: string;
  mediaUrls: string[];
}

// ── 4. Map BE → FE ──────────────────────────────────────────────
const mapPost = (p: PostResponseDto): PostItem => ({
  id: p.Id,
  title: p.Title,
  content: p.Content,
  userId: p.UserId,
  status: p.Status,
  authorName: p.AuthorName,
  authorAvatar: p.AuthorAvatar,
  createdAt: p.CreatedAt,
  mediaUrls: p.MediaUrls || [],
});

// const mapPostAdmin = (p: PostAdminDto): PostAdminItem => ({
//   id: p.Id,
//   author: p.AuthorName || "",
//   authorAvatar: p.AuthorAvatar,
//   title: p.Title,
//   content: p.Content,

//   countLike: p.LikeCount,
//   likes: p.UserLike.map(u => ({
//     userId: u.UserId,
//     userName: u.UserName
//   })),

//   countComment: p.CommentCount,
//   comments: p.Comments.map(c => ({
//     id: c.Id,
//     author: c.UserName,
//     content: c.Content,
//     createdAt: c.CreatedAt || ""
//   })),

//   status:
//     p.Status === 1 ? 'public' :
//       p.Status === 2 ? 'friend' :
//         p.Status === 3 ? 'private' :
//           p.Status === 0 ? 'hidden' : 'delete',

//   createdAt: p.CreatedAt,
//   mediaUrls: p.MediaUrls || [],
// });

export interface PagedPostResponse {
  posts: PostItem[];
  totalCount: number;
  hasMore: boolean;
}


// ── 5. Export Service ───────────────────────────────────────────
export const postService = {
  createPost: (formData: FormData) =>
    axiosInstance
      .post<{ Success: boolean; Message: string; Data: PostResponseDto }>("/api/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),

  getAllPosts: () =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto[] }>("/api/post/all")
      .then((res) => ({ ...res, data: res.data.Data.map(mapPost) })),


  getPostsByUserId: (userId: string) =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto[] }>(`/api/post/user/${userId}`)
      .then((res) => ({ ...res, data: res.data.Data.map(mapPost) })),

  getPostById: (postId: number) =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto }>(
        `/api/post/${postId}`
      )
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),

  deletePost: (postId: number) =>
    axiosInstance
      .delete<{ Success: boolean; Message: string }>(
        `/api/post/delete/${postId}`
      )
      .then((res) => ({
        success: res.data.Success,
        message: res.data.Message,
      })),

  updatePost: (postId: number, formData: FormData) =>
    axiosInstance
      .put<{ Success: boolean; Message: string; Data: PostResponseDto }>(`/api/post/update/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),

  // -------reportPost--------

  reportPost: (request: PostReportRequest) =>
    axiosInstance
      .post<{ Success: boolean; Message: string }>("/api/post-reports", request),

  getPostReportCount: async () => {
    const res = await axiosInstance.get<ApiRes<PostReportDashboardDTO>>(
      'api/post-reports/admin/dashboard'
    )
    return res.data.Data;
  },

  getAllPostReportsAdmin: async () => {
    const res = await axiosInstance.get<ApiRes<PostReportAdminDTO[]>>(
      'api/post-reports/admin/all'
    )
    return res.data.Data;
  },
  
  updateStatusReport: async (
    reportId: number,
    payload: {
      adminNote: string;
      status: number;
      userNameAuthor : string;
    }
  ) => {
    const res = await axiosInstance.put<ApiRes<boolean>>(
      `/api/post-reports/admin/handle/${reportId}`,
      payload
    );

    return res.data.Data;
  },

  // -------Admin API----------
  getAllPostsAdmin: () =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostAdminDto[] }>(
        "/api/post/admin/all")
      .then((res) => ({
        ...res,
        data: res.data.Data
      })),


  updateStatusPost: async (postId: number, status: number) => {
    const res = await axiosInstance.put<ApiRes<string>>(
      `/api/post/${postId}/status`,
      { status }
    );
    return res.data.Message;
  },

  getPostCount: async () => {
    const res = await axiosInstance.get<ApiRes<PostDashboardDTO>>(
      '/api/post/admin/dashboard',
    )
    return res.data.Data;
  },

  getHomeFeed: (page: number = 1, pageSize: number = 10) =>
    axiosInstance
      .get<{ Success: boolean; Data: { Posts: PostResponseDto[]; TotalCount: number; HasMore: boolean } }>(
        `/api/post/feed?page=${page}&pageSize=${pageSize}`
      )
      .then((res) => ({
        ...res,
        data: {
          posts: res.data.Data.Posts.map(mapPost),
          totalCount: res.data.Data.TotalCount,
          hasMore: res.data.Data.HasMore,
        } as PagedPostResponse,
      })),
};