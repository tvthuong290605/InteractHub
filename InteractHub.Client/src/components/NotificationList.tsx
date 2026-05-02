import { useEffect, useState, useRef } from "react";
import {
  notificationService,
  type NotificationItem,
} from "../services/notificationService";
import { getTimeAgo } from "../utils/timeUtils";
import { signalRService } from "../services/signalRService";

const getTypeIcon = (type: string): string => {
  switch (type.toUpperCase()) {
    case "FRIEND_REQUEST": return "👤";
    case "POST_LIKE":
    case "LIKE":           return "❤️";
    case "POST_COMMENT":   return "💬";
    case "SHARE":          return "🔁";
    case "SYSTEM":         return "🔔";
    default:               return "🔔";
  }
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Ref để dùng trong SignalR callback không bị stale
  const notificationsRef = useRef<NotificationItem[]>([]);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // ── Load lần đầu ──────────────────────────────────────────────
  useEffect(() => {
    notificationService
      .getMyNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Lỗi khi tải thông báo:", err);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Realtime: nhận thông báo mới qua SignalR ──────────────────
  useEffect(() => {
    signalRService.onReceiveNotification((newNotif) => {
      setNotifications((prev) => {
        // Tránh duplicate nếu BE push trùng
        if (prev.some((n) => n.id === newNotif.id)) {
          // Cập nhật nếu đã tồn tại (vd: gộp actors)
          return prev.map((n) => (n.id === newNotif.id ? newNotif : n));
        }
        // Prepend thông báo mới lên đầu
        return [newNotif, ...prev];
      });
    }, "notifList");

    return () => {
      signalRService.offReceiveNotification("notifList");
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    notificationService.markAllAsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  const markAsRead = async (id: number, link?: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target) return;

    const navigateTo = (url: string) => {
      const currentFullUrl =
        window.location.pathname + window.location.search + window.location.hash;
      if (url === currentFullUrl || window.location.href.endsWith(url)) {
        window.location.reload();
      } else {
        window.location.assign(url);
      }
    };

    if (target.isRead) {
      if (link) navigateTo(link);
      return;
    }

    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (link) navigateTo(link);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
      if (link) navigateTo(link);
    }
  };

  const renderNotifyMessage = (notif: NotificationItem) => {
    const { lastActorName, actorsCount, message } = notif;
    if (actorsCount > 1) {
      return (
        <span>
          <strong className="text-[var(--color-text)] font-semibold">
            {lastActorName}
          </strong>{" "}
          và{" "}
          <strong className="text-[var(--color-text)] font-semibold">
            {actorsCount - 1} người khác
          </strong>{" "}
          {message}
        </span>
      );
    }
    return (
      <span>
        <strong className="text-[var(--color-text)] font-semibold">
          {lastActorName}
        </strong>{" "}
        {message}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* HEADER */}
      <div
        className="sticky top-0 z-10 flex-shrink-0 bg-[var(--color-bg)]
                   flex items-center justify-between px-4 pt-4 pb-3 border-1 border-[var(--color-border)]"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-[var(--color-text)] uppercase tracking-wider">
            Thông báo
          </h2>
          {unreadCount > 0 && !loading && (
            <span
              className="bg-[#ff0000] text-[var(--color-text)] text-[11px] font-bold
                         px-1.5 py-0.5 rounded-full leading-none"
            >
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && !loading && (
          <button
            onClick={markAllAsRead}
            className="text-[13px] text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2">
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="py-10 text-center px-4">
            <div
              className="mx-auto w-16 h-16 bg-[var(--color-hover)] rounded-full
                         flex items-center justify-center mb-4 text-2xl"
            >
              🔔
            </div>
            <p className="text-[var(--color-text)] text-sm">
              Bạn chưa có thông báo nào
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.link)}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer
                            transition-all group relative
                            ${
                              notif.isRead
                                ? "hover:bg-[var(--color-bg)]"
                                : "bg-[var(--color-bg)] hover:bg-[var(--color-hover)] border-l-4 border-[var(--color-border)] rounded-l-none"
                            }`}
              >
                <div className="relative flex-shrink-0">
                  {notif.lastActorAvatar ? (
                    <img
                      src={`https://localhost:7069${notif.lastActorAvatar}`}
                      alt={notif.lastActorName}
                      className="w-12 h-12 rounded-full object-cover border border-[var(--color-border)]"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full bg-[var(--color-bg)]
                                 flex items-center justify-center text-xl border border-[var(--color-border)]"
                    >
                      {getTypeIcon(notif.type)}
                    </div>
                  )}
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-bg)]
                               flex items-center justify-center text-[12px] border border-[var(--color-border)]"
                  >
                    {getTypeIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-[var(--color-text)] leading-snug">
                    {renderNotifyMessage(notif)}
                  </div>
                  <p
                    className={`text-[12px] mt-1 ${
                      notif.isRead
                        ? "text-[var(--color-text)]"
                        : "text-blue-400 font-semibold"
                    }`}
                  >
                    {getTimeAgo(notif.createdAt)}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full self-center" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;