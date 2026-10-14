import React, { useState, useEffect } from 'react';
import { Search, X, User } from 'lucide-react';
import { messengerApi } from '../services/messengerApi';

export default function WhatsAppUserDirectoryModal({
  isOpen,
  onClose,
  onStartConversation,
}) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const list = await messengerApi.searchUsers(query);
        if (isMounted) setUsers(list);
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 250);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [isOpen, query]);

  if (!isOpen) return null;

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

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '14px 16px',
            background: '#008069',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>New Chat</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SEARCH BOX */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f0f2f5',
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            <Search size={16} color="#54656f" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleague by name or email..."
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

        {/* USER LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#667781', fontSize: 13 }}>
              Searching directory...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#667781', fontSize: 13 }}>
              No colleagues found.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                onClick={() => onStartConversation(u.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8fafc',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f2f5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: getRoleBadgeColor(u.role),
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15,
                    flexShrink: 0,
                    marginRight: 12,
                  }}
                >
                  {(u.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111b21' }}>{u.name}</span>
                    <span
                      style={{
                        background: 'rgba(79, 70, 229, 0.1)',
                        color: getRoleBadgeColor(u.role),
                        padding: '1px 5px',
                        borderRadius: 4,
                        fontSize: 9.5,
                        fontWeight: 700,
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#667781', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
