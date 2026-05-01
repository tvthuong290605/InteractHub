import axiosInstance from "./axiosInstance";

// =====================================================
// API RESPONSE
// =====================================================

type ApiResponse<T> = {
  Success: boolean;
  Message: string;
  Data: T;
};

// =====================================================
// BACKEND DTOs (PascalCase)
// =====================================================

interface SharedPostDto {
  Id: number;

  Title?: string;
  Content?: string;

  UserId?: string;

  Status?: number;

  AuthorName?: string;
  AuthorAvatar?: string;

  CreatedAt?: string;

  MediaUrls?: string[];
}

interface PostResponseDto {
  Id: number;

  Title?: string;
  Content?: string;

  UserId?: string;

  Status?: number;

  AuthorName?: string;
  AuthorAvatar?: string;

  CreatedAt?: string;
  UpdatedAt?: string;

  // Share
  OriginalPostId?: number;
  OriginalPost?: SharedPostDto | null;

  ShareCount?: number;

  // Count
  LikeCount?: number;
  CommentCount?: number;

  MediaUrls?: string[];
}

interface PostSearchResponseDto {
  Id: number;

  Title?: string;
  Content?: string;

  AuthorName: string;
  AuthorAvatar: string;
  AuthorId: string;

  CreatedAt: string;

  LikeCount?: number;
  CommentCount?: number;

  MediaUrls?: string[];
}

interface CommentDto {
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

  Replies: CommentDto[];
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
    Avatar?: string;
    Type?: string;
  }[];

  CommentCount: number;

  Comments: CommentDto[];

  MediaUrls?: string[];
}

interface PostActivityStatDto {
  Month: string;
  Posts: number;
  Comments: number;
  Likes: number;
}

interface PostDashboardDto {
  TotalPosts: number;
  Activity: PostActivityStatDto[];
}

// =====================================================
// FRONTEND TYPES (camelCase)
// =====================================================

export interface SharedPostItem {
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

export interface PostItem {
  id: number;

  title?: string;
  content?: string;

  userId?: string;

  status?: number;

  authorName?: string;
  authorAvatar?: string;

  createdAt?: string;
  updatedAt?: string;

  // Share
  originalPostId?: number;
  originalPost?: SharedPostItem | null;

  shareCount: number;

  // Count
  likeCount: number;
  commentCount: number;

  mediaUrls: string[];
}

export interface PostSearchItem {
  id: number;

  title?: string;
  content?: string;

  authorName: string;
  authorAvatar: string;
  authorId: string;

  createdAt: string;

  likeCount: number;
  commentCount: number;

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

  likes: {
    userId: string;
    userName: string;
  }[];

  countComment: number;

  comments: {
    id: number;
    author: string;
    content: string;
    createdAt: string;
  }[];

  status:
    | "public"
    | "friend"
    | "private"
    | "hidden"
    | "delete";

  createdAt?: string;

  mediaUrls: string[];
}

export interface PagedPostResponse {
  posts: PostItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface SharePostRequest {
  content?: string;

  originalPostId: number;

  status?: number;
}

export interface CreatePostRequest {
  title?: string;
  content?: string;
  status?: number;
  mediaFiles?: File[];
  originalPostId?: number;
}

// =====================================================
// MAPPERS
// =====================================================

const mapSharedPost = (
  post: SharedPostDto
): SharedPostItem => ({
  id: post.Id,

  title: post.Title,
  content: post.Content,

  userId: post.UserId,

  status: post.Status,

  authorName: post.AuthorName,
  authorAvatar: post.AuthorAvatar,

  createdAt: post.CreatedAt,

  mediaUrls: post.MediaUrls || [],
});

const mapPost = (
  post: PostResponseDto
): PostItem => ({
  id: post.Id,

  title: post.Title,
  content: post.Content,

  userId: post.UserId,

  status: post.Status,

  authorName: post.AuthorName,
  authorAvatar: post.AuthorAvatar,

  createdAt: post.CreatedAt,
  updatedAt: post.UpdatedAt,

  // Share
  originalPostId: post.OriginalPostId,

  originalPost: post.OriginalPost
    ? mapSharedPost(post.OriginalPost)
    : null,

  shareCount: post.ShareCount || 0,

  // Count
  likeCount: post.LikeCount || 0,
  commentCount: post.CommentCount || 0,

  mediaUrls: post.MediaUrls || [],
});

const mapPostSearch = (
  post: PostSearchResponseDto
): PostSearchItem => ({
  id: post.Id,

  title: post.Title,
  content: post.Content,

  authorName: post.AuthorName,
  authorAvatar: post.AuthorAvatar,
  authorId: post.AuthorId,

  createdAt: post.CreatedAt,

  likeCount: post.LikeCount || 0,
  commentCount: post.CommentCount || 0,

  mediaUrls: post.MediaUrls || [],
});

// =====================================================
// HELPERS
// =====================================================

const buildPostFormData = (
  data: CreatePostRequest
) => {
  const formData = new FormData();

  if (data.title) {
    formData.append("title", data.title);
  }

  if (data.content) {
    formData.append("content", data.content);
  }

  if (typeof data.status === "number") {
    formData.append(
      "status",
      data.status.toString()
    );
  }

  if (data.mediaFiles?.length) {
    data.mediaFiles.forEach((file) => {
      formData.append("mediaFiles", file);
    });
  }

  return formData;
};

// =====================================================
// POST SERVICE
// =====================================================

export const postService = {
  // =====================================================
  // CREATE POST
  // =====================================================

  createPost: async (
    data: CreatePostRequest | FormData
  ) => {
    const formData =
      data instanceof FormData
        ? data
        : buildPostFormData(data);

    const res =
      await axiosInstance.post<
        ApiResponse<PostResponseDto>
      >("/api/post/create", formData, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

    return {
      ...res,
      data: mapPost(res.data.Data),
    };
  },

  // =====================================================
  // SHARE POST
  // =====================================================

  sharePost: async (
    request: SharePostRequest
  ) => {
    const res =
      await axiosInstance.post<
        ApiResponse<PostResponseDto>
      >("/api/post/share", request);

    return {
      ...res,
      data: mapPost(res.data.Data),
    };
  },

  // =====================================================
  // GET ALL POSTS
  // =====================================================

  getAllPosts: async () => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostResponseDto[]>
      >("/api/post/all");

    return {
      ...res,
      data: (res.data.Data || []).map(mapPost),
    };
  },

  // =====================================================
  // GET POSTS BY USER
  // =====================================================

  getPostsByUserId: async (
    userId: string
  ) => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostResponseDto[]>
      >(`/api/post/user/${userId}`);

    return {
      ...res,
      data: (res.data.Data || []).map(mapPost),
    };
  },

  // =====================================================
  // GET POST BY ID
  // =====================================================

  getPostById: async (postId: number) => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostResponseDto>
      >(`/api/post/${postId}`);

    return {
      ...res,
      data: mapPost(res.data.Data),
    };
  },

  // =====================================================
  // UPDATE POST
  // =====================================================

  updatePost: async (
    postId: number,
    data: CreatePostRequest | FormData
  ) => {
    const formData =
      data instanceof FormData
        ? data
        : buildPostFormData(data);

    const res =
      await axiosInstance.put<
        ApiResponse<PostResponseDto>
      >(`/api/post/update/${postId}`, formData, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      });

    return {
      ...res,
      data: mapPost(res.data.Data),
    };
  },

  // =====================================================
  // DELETE POST
  // =====================================================

  deletePost: async (postId: number) => {
    const res =
      await axiosInstance.delete<
        ApiResponse<null>
      >(`/api/post/delete/${postId}`);

    return {
      success: res.data.Success,
      message: res.data.Message,
    };
  },

  // =====================================================
  // REPORT POST
  // =====================================================

  reportPost: async (
    request: PostReportRequest
  ) => {
    const res =
      await axiosInstance.post<
        ApiResponse<null>
      >("/api/post-reports", request);

    return {
      success: res.data.Success,
      message: res.data.Message,
    };
  },

  // =====================================================
  // HOME FEED
  // =====================================================

  getHomeFeed: async (
    page = 1,
    pageSize = 10
  ) => {
    const res =
      await axiosInstance.get<
        ApiResponse<{
          Posts: PostResponseDto[];
          TotalCount: number;
          HasMore: boolean;
        }>
      >(
        `/api/post/feed?page=${page}&pageSize=${pageSize}`
      );

    return {
      ...res,

      data: {
        posts: (
          res.data.Data.Posts || []
        ).map(mapPost),

        totalCount:
          res.data.Data.TotalCount || 0,

        hasMore:
          res.data.Data.HasMore || false,
      } as PagedPostResponse,
    };
  },

  // =====================================================
  // SEARCH POSTS
  // =====================================================

  searchPosts: async (
    keyword: string
  ): Promise<PostSearchItem[]> => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostSearchResponseDto[]>
      >("/api/post/search", {
        params: { keyword },
      });

    const list = Array.isArray(res.data)
      ? res.data
      : (res.data.Data ?? []);

    return list.map(mapPostSearch);
  },

  // =====================================================
  // ADMIN
  // =====================================================

  getAllPostsAdmin: async () => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostAdminDto[]>
      >("/api/post/admin/all");

    return {
      ...res,
      data: res.data.Data,
    };
  },

  updateStatusPost: async (
    postId: number,
    status: number
  ) => {
    const res =
      await axiosInstance.put<
        ApiResponse<string>
      >(`/api/post/${postId}/status`, {
        status,
      });

    return res.data.Message;
  },

  getPostCount: async () => {
    const res =
      await axiosInstance.get<
        ApiResponse<PostDashboardDto>
      >("/api/post/admin/dashboard");

    return res.data.Data;
  },
};