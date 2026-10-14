import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ExternalLink, Inbox, Send, CheckCircle, Clock } from 'lucide-react';
import { messengerApi } from '../services/messengerApi';

export default function SuggestionsHub({ onRefreshBadges, currentRole }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'outbox'
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'inbox') {
        const res = await messengerApi.getReceivedSuggestions(0, 50);
        setSuggestions(res.content || res || []);
      } else {
        const res = await messengerApi.getSentSuggestions(0, 50);
        setSuggestions(res.content || res || []);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [activeTab]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await messengerApi.markSuggestionAsRead(id);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, readAt: new Date().toISOString() } : s))
      );
      onRefreshBadges?.();
    } catch (err) {
      console.error('Failed to mark suggestion as read:', err);
    }
  };

  const handleNavigateToContext = (suggestion) => {
    // If incoming suggestion is unread, mark read
    if (activeTab === 'inbox' && !suggestion.readAt) {
      handleMarkAsRead(suggestion.id);
    }

    const isIqacOrTrustee = currentRole === 'IQAC' || currentRole === 'TRUSTEE';
    const basePath = isIqacOrTrustee ? '/admin' : '';
    const params = new URLSearchParams();

    if (suggestion.masterProgrammeId) params.set('masterProgrammeId', suggestion.masterProgrammeId);
    if (suggestion.programmeBatchId) params.set('programmeBatchId', suggestion.programmeBatchId);
    if (suggestion.programmeBatchCourseId) params.set('programmeBatchCourseId', suggestion.programmeBatchCourseId);

    // Deep-link to Quick Analysis
    navigate(`${basePath}/analytics/quick-analysis?${params.toString()}`);
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc' }}>
      {/* TOP SEGMENTED CONTROL */}
      <div
        style={{
          padding: '12px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('inbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'inbox' ? '#ffffff' : 'transparent',
              color: activeTab === 'inbox' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: activeTab === 'inbox' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Inbox size={14} color={activeTab === 'inbox' ? '#4f46e5' : '#64748b'} />
            <span>Inbox (Received)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outbox')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: activeTab === 'outbox' ? '#ffffff' : 'transparent',
              color: activeTab === 'outbox' ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
              boxShadow: activeTab === 'outbox' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Send size={14} color={activeTab === 'outbox' ? '#4f46e5' : '#64748b'} />
            <span>Outbox (Sent)</span>
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
          {suggestions.length} {activeTab === 'inbox' ? 'Received' : 'Sent'}
        </div>
      </div>

      {/* SUGGESTION FEED */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
            Loading suggestions...
          </div>
        ) : suggestions.length === 0 ? (
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
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Lightbulb size={24} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
              No {activeTab === 'inbox' ? 'Received' : 'Sent'} Suggestions
            </div>
            <div style={{ fontSize: 12.5, maxWidth: 320, lineHeight: 1.5 }}>
              {activeTab === 'inbox'
                ? 'Academic suggestions from coordinators and directors will appear here.'
                : 'Suggestions you drop while inspecting Analytics will be tracked here.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {suggestions.map((s) => {
              const isUnread = activeTab === 'inbox' && !s.readAt;

              return (
                <div
                  key={s.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: isUnread ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    padding: '14px 16px',
                    boxShadow: isUnread
                      ? '0 4px 12px rgba(99, 102, 241, 0.08)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* UNREAD INDICATOR BADGE */}
                  {isUnread && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 14,
                        background: '#6366f1',
                        color: '#ffffff',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 10,
                        letterSpacing: '0.04em',
                      }}
                    >
                      NEW
                    </span>
                  )}

                  {/* SENDER / RECIPIENT INFO */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        color: '#0f172a',
                      }}
                    >
                      {activeTab === 'inbox' ? s.senderName : `To: ${s.recipientName}`}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#4f46e5',
                        background: 'rgba(79, 70, 229, 0.08)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {activeTab === 'inbox' ? s.senderRole : s.recipientRole}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto', marginRight: isUnread ? 48 : 0 }}>
                      {formatTime(s.createdAt)}
                    </span>
                  </div>

                  {/* ACADEMIC CONTEXT CHIP */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      background: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid #edf2f7',
                      fontSize: 11.5,
                      color: '#334155',
                      marginBottom: 10,
                    }}
                  >
                    {s.programmeName && (
                      <span style={{ fontWeight: 600 }}>🎓 {s.programmeName}</span>
                    )}
                    {s.batchName && (
                      <span style={{ fontWeight: 600 }}>• Batch {s.batchName}</span>
                    )}
                    {s.courseName && (
                      <span style={{ fontWeight: 600 }}>• 📖 {s.courseName}</span>
                    )}
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#d97706',
                        background: 'rgba(217, 119, 6, 0.1)',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {s.category || 'ACADEMIC'}
                    </span>
                  </div>

                  {/* SUGGESTION BODY */}
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: '#1e293b',
                      whiteSpace: 'pre-wrap',
                      marginBottom: 12,
                    }}
                  >
                    {s.content}
                  </div>

                  {/* ACTION FOOTER */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                      {s.readAt ? (
                        <>
                          <CheckCircle size={13} color="#059669" />
                          <span>Viewed on {formatTime(s.readAt)}</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} color="#d97706" />
                          <span>Unread</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigateToContext(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '5px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
                    >
                      <span>View in Analytics</span>
                      <ExternalLink size={12} />
                    </button>
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
