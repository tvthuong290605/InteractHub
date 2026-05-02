import React, { useState } from "react";
import { FaUserCircle, FaVideo, FaImage, FaSmile } from "react-icons/fa";
import PostModal from "./PostModal";
import { useAuth } from "../context/useAuth"; // ✅ import hook
import { resolveUrl } from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn

interface PostingFormProps {
  user?: any;
  variant?: "home" | "profile";
}

const PostingForm: React.FC<PostingFormProps> = ({  variant = "home" }) => {
  const [showForm, setShowForm] = useState(false);
  const { user: authUser } = useAuth(); // ✅ lấy user từ AuthContext

  // Ưu tiên user từ prop (Profile) > user từ AuthContext
  const displayUser = authUser;

  return (
    <div
      className={`bg-bg border border-[var(--color-border)] rounded-3xl p-5 shadow-xl
        ${variant === "profile" ? "w-full" : "max-w-2xl mx-auto"}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {displayUser?.AvatarUrl ? (
            <img
              src={resolveUrl(displayUser.AvatarUrl)}
              alt="avatar"
              className="w-15 h-15 rounded-full  object-cover border-2 border-[var(--color-bg)] hover:border-[var(--color-hover)] transition-all"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/default-avatar.png";
              }}
            />
          ) : (
            <FaUserCircle size={44} className="text-gray-400" />
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex-1 bg-[var(--color-hover)] hover:bg-[#4a4b4d] text-left text-gray-300 
             text-[17px] py-3.5 px-5 rounded-full transition-all duration-200
             focus:outline-none focus:border-[var(--color-border)] active:scale-[0.985]"
        >
          {(() => {
            const name = displayUser?.Username || displayUser?.Username;
            if (!name) return "Bạn đang nghĩ gì?";
            const lastName = name.trim().split(" ").pop();
            return `${lastName} ơi, bạn đang nghĩ gì?`;
          })()}
        </button>
      </div>

      <div className="border-t border-border my-4" />

      <div className="grid grid-cols-3 gap-2">
        <ActionButton icon={<FaVideo className="text-red-500" />} label="Video trực tiếp" textColor="text-[var(--color-text)]"  />
        <ActionButton icon={<FaImage className="text-green-500" />} label="Ảnh/Video" textColor="text-[var(--color-text)]" />
        <ActionButton icon={<FaSmile className="text-orange-500" />} label="Cảm xúc/Hoạt động" textColor="text-[var(--color-text)]" />
      </div>

      {showForm && (
        <PostModal
          user={displayUser}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const ActionButton = ({ icon, label, textColor }: { icon: React.ReactNode; label: string; textColor: string }) => (
  <button
    className="flex items-center justify-center gap-3 py-3.5 hover:bg-bg 
               rounded-2xl transition-all duration-200 text-gray-300 hover:text-[var(--color-text)] group"
  >
    <div className="group-hover:scale-110 transition-transform duration-200">
      {icon}
    </div>
    <span className={`font-medium text-sm ${textColor}`}>{label}</span>
  </button>
);

export default PostingForm;