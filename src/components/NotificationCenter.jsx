import { CheckCheck, Bell, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function NotificationCenter({
  open,
  notifications,
  readIds,
  onClose,
  onMarkAllRead,
  onDismiss,
}) {
  const panelRef = useRef(null);
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    const closeOnOutsideClick = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-notification-trigger]")) {
        return;
      }
      if (!panelRef.current?.contains(event.target)) onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <section
      aria-label="Notifications"
      className="fixed right-3 top-[68px] z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-white/10 bg-[#12101a] text-white shadow-2xl sm:right-6"
      ref={panelRef}
      role="dialog"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold">Notifications</h2>
          <p className="mt-0.5 text-[10px] text-muted">
            {unreadCount ? `${unreadCount} unread` : "You’re all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              aria-label="Mark all notifications as read"
              className="grid size-8 place-items-center rounded-md text-lilac transition hover:bg-white/10"
              onClick={onMarkAllRead}
              title="Mark all as read"
              type="button"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <button
            aria-label="Close notifications"
            className="grid size-8 place-items-center rounded-md text-muted transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="max-h-[min(65vh,28rem)] overflow-y-auto">
        {notifications.length ? (
          notifications.map((item) => {
            const isRead = readIds.includes(item.id);
            return (
              <article
                className={`flex gap-3 border-b border-white/[.06] px-4 py-3 last:border-0 ${isRead ? "opacity-65" : "bg-lilac/[.06]"}`}
                key={item.id}
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.tone}`} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{item.message}</p>
                </div>
                <button
                  aria-label={`Dismiss ${item.title}`}
                  className="grid size-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-white/10 hover:text-white"
                  onClick={() => onDismiss(item.id)}
                  type="button"
                >
                  <X size={13} />
                </button>
              </article>
            );
          })
        ) : (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full bg-lilac/10 text-lilac">
              <Bell size={19} />
            </span>
            <p className="mt-3 text-xs font-semibold">No notifications</p>
            <p className="mt-1 text-[10px] text-muted">You’ve dismissed everything for now.</p>
          </div>
        )}
      </div>
    </section>
  );
}
