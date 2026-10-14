import React, { useState } from 'react';
import { Search, UserPlus, Check, CheckCheck } from 'lucide-react';

export default function WhatsAppConversationList({
  conversations = [],
  activeConversationId = null,
  onSelectConversation,
  onOpenNewChat,
  searchQuery = '',
  onSearchChange,
  currentUserId,
}) {
  const formatWhatsAppTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'IQAC':
      case 'TRUSTEE':
        return '#4f46e5';
      case 'DIRECTOR':
      case 'SCHOOL_PROGRAMME_COORDINATOR':
        return '#0284c7';
      case 'HOD':
        return '#059669';
      case 'PROGRAMME_COORDINATOR':
        return '#d97706';
      default:
        return '#64748b';
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.peerName?.toLowerCase().includes(q) ||
      c.peerRole?.toLowerCase().includes(q) ||
      c.lastMessagePreview?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        minWidth: 260,
        maxWidth: 320,
        flex: '0 0 300px',
      }}
    >
      {/* TOP HEADER */}
      <div
        style={{
          padding: '12px 16px',
          background: '#f0f2f5',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111b21' }}>Chats</div>
        <button
          type="button"
          onClick={onOpenNewChat}
          title="New Chat"
          style={{
            background: 'none',
            border: 'none',
            color: '#54656f',
            cursor: 'pointer',
            padding: 6,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <UserPlus size={19} />
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ padding: '8px 12px', background: '#ffffff', borderBottom: '1px solid #f0f2f5' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#f0f2f5',
            borderRadius: 8,
            padding: '6px 12px',
          }}
        >
          <Search size={16} color="#54656f" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or start new chat"
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: 13,
              color: '#111b21',
            }}
          />
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredConversations.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: '#667781',
              fontSize: 13,
            }}
          >
            {searchQuery ? 'No chats match your search.' : 'No conversations yet.'}
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={onOpenNewChat}
                style={{
                  background: '#25d366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Start a Chat
              </button>
            </div>
          </div>
        ) : (
          filteredConversations.map((c) => {
            const isActive = c.id === activeConversationId;
            const hasUnread = c.unreadCount > 0;
            const isOutgoingLast = c.lastMessageSenderId === currentUserId;

            return (
              <div
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: isActive ? '#f0f2f5' : '#ffffff',
                  borderBottom: '1px solid #f0f2f5',
                  transition: 'background 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#f5f6f6';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#ffffff';
                }}
              >
                {/* AVATAR WITH INITIAL */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: getRoleBadgeColor(c.peerRole),
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 17,
                    flexShrink: 0,
                    marginRight: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {(c.peerName || 'U').charAt(0).toUpperCase()}
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span
                      style={{
                        fontWeight: hasUnread ? 700 : 600,
                        fontSize: 14,
                        color: '#111b21',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.peerName || 'User'}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: hasUnread ? '#25d366' : '#667781',
                        fontWeight: hasUnread ? 700 : 400,
                        marginLeft: 6,
                        flexShrink: 0,
                      }}
                    >
                      {formatWhatsAppTime(c.lastMessageAt)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 12.5,
                        color: hasUnread ? '#111b21' : '#667781',
                        fontWeight: hasUnread ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                      }}
                    >
                      {isOutgoingLast && (
                        <span style={{ display: 'inline-flex', marginRight: 2 }}>
                          {/* If no unread messages from current user in conversation, it has been seen */}
                          {c.unreadCount === 0 ? (
                            <CheckCheck size={14} color="#53bdeb" />
                          ) : (
                            <Check size={14} color="#8696a0" />
                          )}
                        </span>
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.lastMessagePreview || 'Encrypted message'}
                      </span>
                    </div>

                    {/* UNREAD BADGE */}
                    {hasUnread && (
                      <span
                        style={{
                          background: '#25d366',
                          color: '#ffffff',
                          borderRadius: '50%',
                          minWidth: 19,
                          height: 19,
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
