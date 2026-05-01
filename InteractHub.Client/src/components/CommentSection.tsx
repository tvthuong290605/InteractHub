import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import { commentService, type CommentResponse } from "../services/commetService";
import { type PostData } from "./ContainerPost";
import { resolveUrl } from "../utils/urlUtils";

interface CommentSectionProps {
  postId: number;
  authorId?: string;
  post: PostData;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  authorId,
  post,
  onClose,
}) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const highlightedCommentId = location.hash.startsWith("#comment-")
    ? Number(location.hash.replace("#comment-", ""))
    : null;

  const isSharedPost = !!post.originalPostId && !!post.originalPost;

  // ───────────────────────────────────────────────────────────
  // FETCH
  // ───────────────────────────────────────────────────────────

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await commentService.getByPost(postId);
      setComments(data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải bình luận.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!highlightedCommentId) return;

    const timer = setTimeout(() => {
      document
        .getElementById(`comment-${highlightedCommentId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightedCommentId, comments]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ───────────────────────────────────────────────────────────
  // SEND COMMENT
  // ───────────────────────────────────────────────────────────

  const handleAddComment = async () => {
    if (!newComment.trim() || sending) return;

    try {
      setSending(true);

      const data = await commentService.create({
        PostId: postId,
        Content: newComment.trim(),
        ParentId: null,
      });

      if (data) {
        setComments((prev) => [...prev, data]);
        setNewComment("");

        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi gửi bình luận");
    } finally {
      setSending(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // RENDER MEDIA
  // ───────────────────────────────────────────────────────────

  const renderMedia = (url: string, index: number) => {
    const fullUrl = resolveUrl(url);
    if (!fullUrl) return null;

    if (/\.(mp4|webm|ogg)$/i.test(url)) {
      return (
        <video
          key={index}
          src={fullUrl}
          controls
          className="w-full max-h-[500px] rounded-xl object-contain bg-black"
        />
      );
    }

    return (
      <img
        key={index}
        src={fullUrl}
        alt={`media-${index}`}
        className="w-full max-h-[500px] rounded-xl object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  };

  // ───────────────────────────────────────────────────────────
  // RENDER ORIGINAL POST (khung lồng bên trong)
  // ───────────────────────────────────────────────────────────

  const renderOriginalPost = () => {
    const shared = post.originalPost;
    if (!shared) return null;

    return (
      <div
        onClick={() => navigate(`/post/${shared.id}`)}
        className="
          border border-border
          rounded-2xl
          overflow-hidden
          bg-[#1e1f22]
          hover:bg-[#2b2d31]
          transition-all
          cursor-pointer
          mt-3
        "
      >
        {/* Header bài gốc */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <img
            src={
              shared.authorAvatar
                ? resolveUrl(shared.authorAvatar)
                : "/assets/img/icons8-user-default-64.png"
            }
            alt={shared.fullName}
            className="w-9 h-9 rounded-full object-cover shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (shared.userId) navigate(`/profile/${shared.userId}`);
            }}
          />

          <div className="flex flex-col">
            <p
              onClick={(e) => {
                e.stopPropagation();
                if (shared.userId) navigate(`/profile/${shared.userId}`);
              }}
              className="font-semibold text-[14px] leading-tight hover:underline text-white"
            >
              {shared.fullName}
            </p>

            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{new Date(shared.createdAt).toLocaleString("vi-VN")}</span>
              <span>·</span>
              <span>🌍</span>
            </div>
          </div>
        </div>

        {/* Nội dung bài gốc */}
        {(shared.title || shared.content) && (
          <div className="px-4 pb-3">
            {shared.title && (
              <p className="font-bold text-[15px] mb-1 text-white">
                {shared.title}
              </p>
            )}
            {shared.content && (
              <p className="text-[14px] text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                {shared.content}
              </p>
            )}
          </div>
        )}

        {/* Media bài gốc */}
        {shared.mediaUrls?.length > 0 && (
          <div className="border-t border-border">
            <div
              className={`grid gap-2 p-2 ${
                shared.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {shared.mediaUrls.map((url, index) => (
                <div key={index}>{renderMedia(url, index)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────
  // RENDER LEFT PANEL
  // ───────────────────────────────────────────────────────────

  const renderLeftPanel = () => {
    return (
      <div className="p-4 space-y-3">
        {/* Author của bài share (hoặc bài thường) */}
        <div className="flex items-center gap-3">
          <img
            src={
              post.authorAvatar
                ? resolveUrl(post.authorAvatar)
                : "/assets/img/icons8-user-default-64.png"
            }
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover cursor-pointer shrink-0"
            onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
            onError={(e) => {
              e.currentTarget.src = "/assets/img/icons8-user-default-64.png";
            }}
          />

          <div>
            {isSharedPost && (
              <p className="text-xs text-gray-400 mb-0.5">
                🔁 Đã chia sẻ một bài viết
              </p>
            )}

            <p
              className="font-semibold text-white cursor-pointer hover:underline"
              onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
            >
              {post.fullName}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Caption của người share (title + content của bài share wrapper) */}
        {post.title && (
          <p className="font-bold text-[17px] text-white">{post.title}</p>
        )}

        {post.content && (
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-gray-200">
            {post.content}
          </p>
        )}

        {/* Nếu là bài share: hiện khung bài gốc lồng vào */}
        {isSharedPost
          ? renderOriginalPost()
          : post.mediaUrls?.length > 0 && (
              <div
                className={`grid gap-2 ${
                  post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {post.mediaUrls.map((url, index) => (
                  <div key={index}>{renderMedia(url, index)}</div>
                ))}
              </div>
            )}
      </div>
    );
  };

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl h-[92vh] bg-bg border border-border rounded-2xl overflow-hidden shadow-2xl flex">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-red-500 text-white transition"
        >
          ✕
        </button>

        {/* Left */}
        <div className="w-[55%] border-r border-border flex flex-col overflow-y-auto no-scrollbar">
          {renderLeftPanel()}
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-white font-bold">
              Bình luận
              <span className="ml-2 text-gray-400 text-sm font-normal">
                ({comments.length})
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-7 h-7 rounded-full border-2 border-border border-t-transparent animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-3">{error}</p>
                <button
                  onClick={fetchComments}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Tải lại
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <span className="text-4xl">💬</span>
                <p className="text-gray-500">Chưa có bình luận nào</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.Id}
                  id={`comment-${comment.Id}`}
                >
                  <Comment
                    comment={comment}
                    postId={postId}
                    parentUserName={comment.ParentUserName}
                    highlighted={comment.Id === highlightedCommentId}
                    postAuthorId={authorId}
                  />
                </div>
              ))
            )}

            <div ref={commentsEndRef} />
          </div>

          <div className="border-t border-border p-4 flex items-center gap-3 bg-bg">
            <input
              type="text"
              value={newComment}
              placeholder="Viết bình luận..."
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              className="flex-1 bg-bg border border-border rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
            />

            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || sending}
              className="px-5 py-3 rounded-2xl bg-bg hover:bg-bg disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition"
            >
              {sending ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;