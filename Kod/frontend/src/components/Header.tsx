import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo final.png";
import { Sling as Hamburger } from "hamburger-react";
import Axios from "axios";
import notifIcon from "../assets/notification icon1.png";
import adminIcon from "../assets/AdminPanel icon.png";

type HeaderProps = {
  logoTarget: string;
  centerActions?: ReactNode;
  rightActions?: ReactNode;
};

interface NotificationItem {
  notification_id: number;
  user_id: number;
  username?: string;
  project_title?: string;
  type:
    | "join_request"
    | "request_accepted"
    | "request_declined"
    | "request_resolved";
  reference_id: number | null;
  message: string;
  is_read: number | boolean;
  created_at: string;
  status?: "accepted" | "declined" | "pending";
}

const Header: React.FC<HeaderProps> = ({
  logoTarget,
  centerActions,
  rightActions,
}) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = () => {
    Axios.get("http://localhost:3001/notifications", {
      withCredentials: true,
    })
      .then((res: any) => {
        setNotifications(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  const markNotificationSeen = () => {
    Axios.put(
      "http://localhost:3001/notifications/mark-seen",
      {},
      { withCredentials: true },
    ).catch((err: any) => {
      console.log(err);
    });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/login", {
      withCredentials: true,
    })
      .then((res) => {
        setIsLoggedIn(!!res.data.loggedIn);

        if (res.data.loggedIn) {
          setIsAdmin(res.data.user.role === "admin");
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    loadNotifications();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !notifOpen) return;

    markNotificationSeen();
  }, [isLoggedIn, notifOpen]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markNotificationResolved = (
    requestId: number,
    resolvedText: "Request accepted" | "Request declined",
    status: "accepted" | "declined",
  ) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.reference_id === requestId && notif.type === "join_request"
          ? {
              ...notif,
              type: "request_resolved" as any,
              message: resolvedText,
              status,
              is_read: true,
            }
          : notif,
      ),
    );
  };

  const handleAccept = (requestId: number) => {
    Axios.post(
      `http://localhost:3001/join-requests/${requestId}/accept`,
      {},
      { withCredentials: true },
    )
      .then(() => {
        markNotificationResolved(requestId, "Request accepted", "accepted");
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.message || "Failed to accept request");
      });
  };

  const handleDecline = (requestId: number) => {
    Axios.post(
      `http://localhost:3001/join-requests/${requestId}/decline`,
      {},
      { withCredentials: true },
    )
      .then(() => {
        markNotificationResolved(requestId, "Request declined", "declined");
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.message || "Failed to decline request");
      });
  };

  return (
    <header className="header-left">
      <img
        src={logo}
        alt="Logo"
        className="logo"
        onClick={() => navigate(logoTarget)}
      />

      <div className="header-center">{centerActions}</div>

      <div className="header-right">
        {isAdmin && (
          <button className="admin" onClick={() => navigate("/admin")}>
            <img src={adminIcon} alt="admin panel icon" />
          </button>
        )}
        {isLoggedIn && (
          <div className="notifications-wrapper">
            <button
              className="notification-button"
              onClick={() => setNotifOpen((prev) => !prev)}
            >
              <img src={notifIcon} alt="notification icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="notification-dropdown">
                <h4>Notifications</h4>

                {notifications.length === 0 ? (
                  <p className="notification-empty">No notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`notification-item ${
                        notif.is_read ? "" : "unread"
                      }`}
                    >
                      <p>
                        {notif.type === "join_request"
                          ? `${notif.username} wants to join your project "${notif.project_title}"`
                          : notif.type === "request_accepted"
                            ? "Your join request was accepted"
                            : notif.type === "request_declined"
                              ? "Your join request was declined"
                              : "Notification"}
                      </p>

                      {notif.type === "join_request" &&
                      notif.status === "pending" ? (
                        <div className="notification-actions">
                          <button
                            onClick={() => handleAccept(notif.reference_id!)}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(notif.reference_id!)}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <p
                          className={`notification-result-text ${
                            notif.status === "accepted"
                              ? "notif-accepted"
                              : notif.status === "declined"
                                ? "notif-declined"
                                : ""
                          }`}
                        >
                          {notif.message}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {rightActions}
      </div>

      <div className="hamburger-container">
        <Hamburger toggled={isOpen} toggle={setIsOpen} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {centerActions} {rightActions}
        </div>
      )}
    </header>
  );
};

export default Header;
