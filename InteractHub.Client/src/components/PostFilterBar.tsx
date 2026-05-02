import React from "react";
import { FaFilter, FaTh, FaSort } from "react-icons/fa";

export type SortOrder = "newest" | "oldest";
export type StatusFilter = "all" | "1" | "2" | "3" | "0";

interface PostFilterBarProps {
  sort: SortOrder;
  status: StatusFilter;
  onSortChange: (sort: SortOrder) => void;
  onStatusChange: (status: StatusFilter) => void;
  onManageClick: () => void;
  isOwnProfile: boolean;
  isFriend: boolean;
}

const PostFilterBar: React.FC<PostFilterBarProps> = ({
  sort,
  status,
  onSortChange,
  onStatusChange,
  onManageClick,
  isOwnProfile,
  isFriend,
}) => {
  // Tính danh sách status được phép hiện
  const statusOptions = (() => {
    if (isOwnProfile) {
      // Chủ trang: xem được tất cả
      return [
        { value: "all", label: "Tất cả",    emoji: "🌐" },
        { value: "1",   label: "Công khai",  emoji: "🌍" },
        { value: "2",   label: "Bạn bè",     emoji: "👥" },
        { value: "3",   label: "Riêng tư",   emoji: "🔒" },
        { value: "0",   label: "Bị vi phạm",   emoji: "⚠️" },
      ];
    }
    if (isFriend) {
      // Bạn bè: xem được công khai + bạn bè
      return [
        { value: "all", label: "Tất cả",   emoji: "🌐" },
        { value: "1",   label: "Công khai", emoji: "🌍" },
        { value: "2",   label: "Bạn bè",    emoji: "👥" },
      ];
    }
    // Người lạ: chỉ xem công khai
    return [
      { value: "all", label: "Tất cả",   emoji: "🌐" },
      { value: "1",   label: "Công khai", emoji: "🌍" },
    ];
  })();

  return (
    <div className="bg-[var(--color-bg)] p-4 rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-[var(--color-text)]">Bài viết</h3>
        {isOwnProfile && (
          <button
            onClick={onManageClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg)] hover:bg-[var(--color-hover)]
                       text-[var(--color-text)] text-sm rounded-lg transition-colors"
          >
            <FaTh size={13} />
            Quản lý bài viết
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-[var(--color-bg)] rounded-lg p-1">
          <FaFilter size={12} className="text-gray-400 ml-1" />
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value as StatusFilter)}
              className={`px-3 py-1 rounded-md text-sm transition-colors
                ${status === opt.value
                  ? "hover:bg-[var(--color-blue)] text-[var(--color-text)]"
                  : "text-[var(--color-text)] hover:bg-[var(--color-blue)]"
                }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-bg)] rounded-lg p-1">
          <FaSort size={12} className="text-gray-400 ml-1" />
          {(["newest", "oldest"] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-3 py-1 rounded-md text-sm transition-colors
                ${sort === s
                  ? "hover:bg-[var(--color-blue)] text-[var(--color-text)]"
                  : "text-[var(--color-text)] hover:bg-[var(--color-blue)]"
                }`}
            >
              {s === "newest" ? "🕐 Mới nhất" : "🕰️ Cũ nhất"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostFilterBar;