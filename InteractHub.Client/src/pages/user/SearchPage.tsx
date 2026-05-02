import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserFriends, FaNewspaper, FaSearch,
  FaUserPlus, FaCheck, FaUserClock,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { userService, type UserSearchResult } from "../../services/userService";
import { postService, type PostSearchItem } from "../../services/postService";
import Post from "../../components/Post"; // ✅ tái sử dụng component Post có sẵn

const API = "https://localhost:7069/api";

type FriendStatus = "none" | "pending" | "received" | "friend" | "blocked" | "accepting";
type FilterType   = "all" | "people" | "posts";

const HISTORY_KEY = "interact_hub_search_history";

const saveHistory = (keyword: string) => {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const next = [keyword, ...prev.filter((k) => k !== keyword)].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([keyword]));
  }
};

const mapApiStatus = (s?: string): FriendStatus => {
  switch (s) {
    case "Pending":  return "pending";
    case "Received": return "received";
    case "Friend":   return "friend";
    case "Blocked":  return "blocked";
    default:         return "none";
  }
};

/** Map PostSearchItem → format mà component Post nhận */
const mapToPostProps = (p: PostSearchItem) => ({
  id:           p.id,
  userId:       p.authorId,
  fullName:     p.authorName,
  authorAvatar: p.authorAvatar,
  title:        p.title ?? "", // search API chưa trả về title, tạm để trống
  content:      p.content ?? "",
  mediaUrls:    p.mediaUrls,
  createdAt:    p.createdAt,
  status:       1, // search chỉ trả về bài công khai
});

// ── Component ─────────────────────────────────────────────────────────────────

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const keyword  = new URLSearchParams(location.search).get("q") || "";

  const [activeTab,      setActiveTab]      = useState<FilterType>("all");
  const [people,         setPeople]         = useState<UserSearchResult[]>([]);
  const [posts,          setPosts]          = useState<PostSearchItem[]>([]);
  const [loadingPeople,  setLoadingPeople]  = useState(false);
  const [loadingPosts,   setLoadingPosts]   = useState(false);
  const [friendStatuses, setFriendStatuses] = useState<Record<string, FriendStatus>>({});

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("interact_hub_user") || "null"); }
    catch { return null; }
  })();

  useEffect(() => {
    if (!keyword.trim()) return;
    saveHistory(keyword);
    setActiveTab("all");
    fetchPeople(keyword);
    fetchPosts(keyword);
  }, [keyword]);

  const fetchPeople = async (q: string) => {
    setLoadingPeople(true);
    setPeople([]);
    setFriendStatuses({});
    try {
      const data = await userService.searchUsers(q, currentUser?.Id);
      setPeople(data);
      const initial: Record<string, FriendStatus> = {};
      data.forEach((u) => { initial[u.Id] = mapApiStatus(u.FriendshipStatus); });
      setFriendStatuses(initial);
    } catch {
      setPeople([]);
      setFriendStatuses({});
    }
    finally { setLoadingPeople(false); }
  };

  const fetchPosts = async (q: string) => {
    setLoadingPosts(true);
    setPosts([]);
    try {
      const data = await postService.searchPosts(q);
      console.log("Search results:", data);
      setPosts(data);
    } catch {
      setPosts([]);
    }
    finally { setLoadingPosts(false); }
  };

  const handleAddFriend = async (userId: string) => {
    setFriendStatuses((prev) => ({ ...prev, [userId]: "pending" }));
    try {
      await axios.post(`${API}/friends/request`, {
        senderId: currentUser?.Id, receiverId: userId,
      });
    } catch {
      setFriendStatuses((prev) => ({ ...prev, [userId]: "none" }));
    }
  };

  const handleAcceptFriend = async (userId: string) => {
    setFriendStatuses((prev) => ({ ...prev, [userId]: "accepting" }));
    try {
      await axios.put(`${API}/friends/accept`, {
        requesterId: userId, receiverId: currentUser?.Id,
      });
      setFriendStatuses((prev) => ({ ...prev, [userId]: "friend" }));
    } catch {
      setFriendStatuses((prev) => ({ ...prev, [userId]: "received" }));
    }
  };

  const tabs: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all",    label: "Tất cả",    icon: <HiSparkles size={15} /> },
    { key: "people", label: "Mọi người", icon: <FaUserFriends size={15} /> },
    { key: "posts",  label: "Bài viết",  icon: <FaNewspaper size={15} /> },
  ];

  const showPeople = activeTab === "all" || activeTab === "people";
  const showPosts  = activeTab === "all" || activeTab === "posts";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Breadcrumb */}
      <div className="border-b border-white/5 bg-[var(--color-bg)] backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <FaSearch size={12} className="text-gray-500" />
          <span className="text-gray-500">Tìm kiếm</span>
          {keyword && (
            <>
              <span className="text-gray-700">/</span>
              <span className="text-[var(--color-text)] font-semibold truncate max-w-xs">"{keyword}"</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">

        {/* Sidebar desktop */}
        <aside className="w-[210px] flex-shrink-0 hidden md:block">
          <div className="sticky top-[52px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-3 px-1">
              Bộ lọc
            </p>
            <nav className="flex flex-col gap-0.5">
              {tabs.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === key
                      ? "bg-[#1877f2]/10 text-[#4d9fff]"
                      : "text-gray-400 hover:bg-white/5 hover:text-[var(--color-text)]"
                  }`}
                >
                  {activeTab === key && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-[#1877f2] rounded-full" />
                  )}
                  <span className={activeTab === key ? "text-[#4d9fff]" : "text-gray-600 group-hover:text-gray-300"}>
                    {icon}
                  </span>
                  {label}
                  {key === "people" && !loadingPeople && people.length > 0 && (
                    <span className="ml-auto text-[10px] bg-[#1877f2]/20 text-[#4d9fff] px-1.5 py-0.5 rounded-full">
                      {people.length}
                    </span>
                  )}
                  {key === "posts" && !loadingPosts && posts.length > 0 && (
                    <span className="ml-auto text-[10px] bg-[#1877f2]/20 text-[#4d9fff] px-1.5 py-0.5 rounded-full">
                      {posts.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="flex gap-1 mb-5 md:hidden bg-[#1a1d27] p-1 rounded-xl">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === key
                    ? "bg-[#1877f2] text-[var(--color-text)] shadow-lg shadow-blue-900/40"
                    : "text-gray-400 hover:text-[var(--color-text)]"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Heading */}
          {keyword ? (
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                Kết quả cho{" "}
                <span className="text-[#4d9fff] bg-[#1877f2]/10 px-2 py-0.5 rounded-lg">
                  {keyword}
                </span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {loadingPeople || loadingPosts
                  ? "Đang tìm kiếm…"
                  : `${people.length} người · ${posts.length} bài viết`}
              </p>
            </div>
          ) : (
            <EmptySearch />
          )}

          {keyword && (
            <>
              {/* PEOPLE */}
              {showPeople && (
                <section className="mb-8">
                  <SectionHeader
                    icon={<FaUserFriends size={14} />}
                    title="Mọi người"
                    count={people.length}
                    loading={loadingPeople}
                  />
                  {loadingPeople ? (
                    <PeopleSkeleton />
                  ) : people.length > 0 ? (
                    <div className=" border border-white/5 bg-[var(--color-bg)] rounded-2xl p-4">
                      {people.map((u) => (
                        <UserCard
                          key={u.Id}
                          user={u}
                          currentUserId={currentUser?.Id}
                          status={friendStatuses[u.Id] ?? "none"}
                          onViewProfile={() => navigate(`/profile/${u.Id}`)}
                          onAddFriend={() => handleAddFriend(u.Id)}
                          onAccept={() => handleAcceptFriend(u.Id)}
                        />
                      ))}
                    </div>
                  ) : activeTab === "people" ? (
                    <EmptySection label="người dùng" />
                  ) : null}
                </section>
              )}

              {/* POSTS — dùng lại component Post */}
              {showPosts && (
                <section>
                  <SectionHeader
                    icon={<FaNewspaper size={14} />}
                    title="Bài viết"
                    count={posts.length}
                    loading={loadingPosts}
                  />
                  {loadingPosts ? (
                    <PostsSkeleton />
                  ) : posts.length > 0 ? (
                    <div>
                      {posts.map((p) => (
                        <Post key={p.id} post={mapToPostProps(p)} />
                      ))}
                    </div>
                  ) : activeTab === "posts" ? (
                    <EmptySection label="bài viết" />
                  ) : null}
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, count, loading }: {
  icon: React.ReactNode; title: string; count?: number; loading?: boolean;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[#4d9fff]">{icon}</span>
    <h2 className="text-sm font-semibold text-[var(--color-text)]">{title}</h2>
    {loading ? (
      <span className="ml-1 h-3 w-10 bg-white/10 rounded-full animate-pulse inline-block" />
    ) : count !== undefined && count > 0 ? (
      <span className="ml-1 text-xs bg-[#1877f2]/15 text-[#4d9fff] px-2 py-0.5 rounded-full font-medium">
        {count}
      </span>
    ) : null}
  </div>
);

const UserCard = ({ user, currentUserId, status, onViewProfile, onAddFriend, onAccept }: {
  user: UserSearchResult;
  currentUserId?: string;
  status: FriendStatus;
  onViewProfile: () => void;
  onAddFriend: () => void;
  onAccept: () => void;
}) => {
  const avatarSrc = user.AvatarUrl
    ? `https://localhost:7069${user.AvatarUrl}`
    : "/images/default-avatar.png";

  const renderAction = () => {
    if (user.Id === currentUserId) return null;
    switch (status) {
      case "friend":
        return (
          <span className="flex items-center gap-1.5 text-xs text-[#4d9fff] bg-[#1877f2]/10 px-2.5 py-1.5 rounded-lg font-medium">
            <FaCheck size={9} /> Bạn bè
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1.5 rounded-lg font-medium">
            <FaUserClock size={11} /> Đã gửi
          </span>
        );
      case "received":
        return (
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-400 active:scale-95 text-[var(--color-text)] px-3 py-1.5 rounded-lg font-medium transition-all shadow-md shadow-green-900/30"
          >
            <FaCheck size={10} /> Chấp nhận
          </button>
        );
      case "accepting":
        return <span className="text-xs text-gray-500 px-2.5 py-1.5 animate-pulse">Đang xử lý…</span>;
      case "blocked":
        return null;
      default:
        return (
          <button
            onClick={onAddFriend}
            className="flex items-center gap-1.5 text-xs bg-[#1877f2] hover:bg-[#166fe5] active:scale-95 text-[var(--color-text)] px-3 py-1.5 rounded-lg font-medium transition-all shadow-md shadow-blue-900/30"
          >
            <FaUserPlus size={11} /> Kết bạn
          </button>
        );
    }
  };

  return (
    <div className="group flex items-center gap-3 bg-[var(--color-bg)] hover:bg-[var(--color-hover1)] border border-white/5 hover:border-white/10 rounded-2xl p-3.5 transition-all duration-200">
      <div className="flex-shrink-0 cursor-pointer" onClick={onViewProfile}>
        <img
          src={avatarSrc} alt=""
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-[#1877f2]/40 transition-all"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold text-sm text-[var(--color-text)] truncate cursor-pointer hover:text-[#4d9fff] transition-colors"
          onClick={onViewProfile}
        >
          {user.FullName || user.Username}
        </p>
        <p className="text-xs text-gray-500 truncate">@{user.Username}</p>
        {user.MutualFriends > 0 && (
          <p className="text-xs text-gray-600 mt-0.5">{user.MutualFriends} bạn chung</p>
        )}
      </div>
      <div className="flex-shrink-0">{renderAction()}</div>
    </div>
  );
};

const PeopleSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 bg-[#1a1d27] rounded-2xl p-3.5 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-white/5 flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
          <div className="h-2.5 bg-white/5 rounded w-1/3" />
        </div>
        <div className="w-16 h-7 bg-white/5 rounded-lg flex-shrink-0" />
      </div>
    ))}
  </div>
);

const PostsSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-[#1a1d27] rounded-3xl p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-white/5 flex-shrink-0" />
          <div>
            <div className="h-3 bg-white/5 rounded w-28 mb-1.5" />
            <div className="h-2.5 bg-white/5 rounded w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

const EmptySection = ({ label }: { label: string }) => (
  <div className="py-10 text-center bg-[#1a1d27] rounded-2xl border border-white/5">
    <p className="text-gray-500 text-sm">Không tìm thấy {label} nào.</p>
  </div>
);

const EmptySearch = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 rounded-2xl bg-[#1a1d27] border border-white/5 flex items-center justify-center mb-4">
      <FaSearch size={24} className="text-gray-600" />
    </div>
    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Tìm kiếm gì đó</h3>
    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
      Nhập từ khóa vào ô tìm kiếm bên trên để tìm người dùng và bài viết.
    </p>
  </div>
);

export default SearchPage;