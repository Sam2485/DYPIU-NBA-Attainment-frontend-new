import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, AlertTriangle, Clock, ExternalLink, CheckCheck } from 'lucide-react';
import { messengerApi } from '../services/messengerApi';

export default function NotificationsHub({ onRefreshBadges }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await messengerApi.getNotifications(0, 50);
      setNotifications(res.content || res || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await messengerApi.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      onRefreshBadges?.();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await messengerApi.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
      onRefreshBadges?.();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleNavigate = (notification) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification.id);
    }
    if (notification.deepLink) {
      navigate(notification.deepLink);
    }
  };

  const getEventBadge = (title = '', eventType = '') => {
    const t = title.toUpperCase();
    if (t.includes('APPROVED')) {
      return {
        icon: CheckCircle2,
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.1)',
        label: 'APPROVED',
      };
    }
    if (t.includes('REVISION')) {
      return {
        icon: AlertTriangle,
        color: '#d97706',
        bg: 'rgba(217, 119, 6, 0.1)',
        label: 'REVISION REQUESTED',
      };
    }
    return {
      icon: Clock,
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.1)',
      label: eventType || 'PENDING',
    };
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* TOP HEADER */}
      <div
        style={{
          padding: '12px 18px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Workflow Notifications</div>
          {unreadCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: 12,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            <CheckCheck size={14} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* NOTIFICATION FEED */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            Loading workflow notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: 'center',
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Bell size={24} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>No Notifications</div>
            <div style={{ fontSize: 12.5, maxWidth: 300, lineHeight: 1.5 }}>
              Authoritative approval alerts and review updates will be delivered here automatically.
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {notifications.map((n) => {
              const isUnread = !n.readAt;
              const badge = getEventBadge(n.title, n.eventType);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNavigate(n)}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: isUnread ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                    padding: '14px 16px',
                    boxShadow: isUnread
                      ? '0 4px 12px rgba(59, 130, 246, 0.08)'
                      : '0 1px 3px rgba(0,0,0,0.03)',
                    cursor: n.deepLink ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: badge.bg,
                        color: badge.color,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      <BadgeIcon size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 13.5, fontWeight: isUnread ? 800 : 700, color: '#0f172a' }}>
                          {n.title}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            color: badge.color,
                            background: badge.bg,
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {badge.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                          {formatTime(n.createdAt)}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12.5,
                          lineHeight: 1.45,
                          color: '#334155',
                          marginBottom: 8,
                        }}
                      >
                        {n.message}
                      </div>

                      {n.deepLink && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0284c7', fontSize: 11.5, fontWeight: 700 }}>
                          <span>Open Approval Workspace</span>
                          <ExternalLink size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
