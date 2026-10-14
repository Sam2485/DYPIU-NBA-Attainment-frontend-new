import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Lightbulb, Bell, X, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { messengerApi } from './services/messengerApi';
import { encryptMessage } from './services/crypto';
import WhatsAppConversationList from './chat/WhatsAppConversationList';
import WhatsAppChatArea from './chat/WhatsAppChatArea';
import WhatsAppUserDirectoryModal from './chat/WhatsAppUserDirectoryModal';
import SuggestionsHub from './suggestions/SuggestionsHub';
import AnalyticsSuggestionComposer from './suggestions/AnalyticsSuggestionComposer';
import NotificationsHub from './notifications/NotificationsHub';
import './EmmuChatModal.css';

export default function EmmuChatModal({
  chatState = 'closed',
  cardRef,
  onClose,
  academicContext = null,
  setEmmuState,
  onBadgeCountsChange,
}) {
  const { user, role: currentRole } = useAuth();
  const currentUserId = user?.id || null;

  // Active top navigation tab: 'chats' | 'suggestions' | 'notifications'
  const [activeTab, setActiveTab] = useState('chats');

  // Badge counts
  const [badges, setBadges] = useState({
    unreadChats: 0,
    unreadSuggestions: 0,
    unreadNotifications: 0,
    totalUnread: 0,
  });

  // Resizable card dimensions (expanded for WhatsApp split-pane)
  const [cardSize, setCardSize] = useState({ width: 760, height: 620 });
  const [isResizing, setIsResizing] = useState(false);

  // Chat state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Suggestion composer state
  const [isSuggestionComposerOpen, setIsSuggestionComposerOpen] = useState(false);

  const isOpen = chatState === 'open' || chatState === 'opening';
  const isCardVisible = chatState === 'open';
  const avatarSrc = `${import.meta.env.BASE_URL}emmu_message.png`;

  // Fetch badge counts
  const refreshBadges = useCallback(async () => {
    try {
      const data = await messengerApi.getBadgeCounts();
      setBadges(data);
      onBadgeCountsChange?.(data);
    } catch (err) {
      // Silently ignore if unauthenticated or network drop
    }
  }, [onBadgeCountsChange]);

  // Initial & periodic badge load
  useEffect(() => {
    refreshBadges();
    const interval = setInterval(refreshBadges, 25000);
    return () => clearInterval(interval);
  }, [refreshBadges]);

  // Load conversations when on 'chats' tab or modal opens
  const loadConversations = useCallback(async () => {
    try {
      const list = await messengerApi.listConversations();
      setConversations(list);
      // Auto-select first conversation if none selected
      if (!activeConversationId && list.length > 0) {
        setActiveConversationId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (isOpen && activeTab === 'chats') {
      loadConversations();
    }
  }, [isOpen, activeTab, loadConversations]);

  // Load messages for active conversation & mark read
  const loadActiveMessages = useCallback(async (convId) => {
    if (!convId) return;
    try {
      const msgs = await messengerApi.getConversationMessages(convId, 0, 50);
      setActiveMessages(msgs);
      await messengerApi.markConversationAsRead(convId);
      refreshBadges();
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
    }
  }, [refreshBadges]);

  useEffect(() => {
    if (isOpen && activeTab === 'chats' && activeConversationId) {
      loadActiveMessages(activeConversationId);

      // Light polling for live chat updates
      const chatPoll = setInterval(() => {
        loadActiveMessages(activeConversationId);
      }, 4000);

      return () => clearInterval(chatPoll);
    }
  }, [isOpen, activeTab, activeConversationId, loadActiveMessages]);

  // Send E2EE message
  const handleSendMessage = async (plainText) => {
    if (!activeConversationId || !plainText.trim()) return;
    setIsSendingMessage(true);
    try {
      const encrypted = await encryptMessage(plainText, activeConversationId);
      await messengerApi.sendMessage(activeConversationId, encrypted);
      await loadActiveMessages(activeConversationId);
      await loadConversations();
      refreshBadges();
    } catch (err) {
      console.error('Failed to send encrypted message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Start new conversation from directory
  const handleStartConversation = async (peerUserId) => {
    try {
      const conv = await messengerApi.getOrCreateDirectConversation(peerUserId);
      setIsNewChatModalOpen(false);
      setActiveTab('chats');
      setActiveConversationId(conv.id);
      await loadConversations();
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  // Resizing handlers
  const handleResizeStart = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = cardSize.width;
    const startHeight = cardSize.height;

    const onPointerMove = (moveEvent) => {
      let newW = startWidth;
      let newH = startHeight;
      if (direction === 'e' || direction === 'se') {
        newW = Math.max(500, Math.min(window.innerWidth - 40, startWidth + (moveEvent.clientX - startX)));
      }
      if (direction === 's' || direction === 'se') {
        newH = Math.max(450, Math.min(window.innerHeight - 40, startHeight + (moveEvent.clientY - startY)));
      }
      setCardSize({ width: newW, height: newH });
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const isAnalyticsView = academicContext?.pathname?.includes('analytics');

  return (
    <div className={`emmu-chat-overlay ${isOpen ? 'open' : ''}`}>
      <div
        ref={cardRef}
        className={`emmu-chat-card ${isResizing ? 'is-resizing' : ''}`}
        style={{
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          visibility: isCardVisible ? 'visible' : 'hidden',
          transform: 'none',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.28)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* RESIZE HANDLES */}
        <div
          className="emmu-resize-handle-edge-r"
          onPointerDown={(e) => handleResizeStart(e, 'e')}
          title="Drag to resize width"
        />
        <div
          className="emmu-resize-handle-edge-b"
          onPointerDown={(e) => handleResizeStart(e, 's')}
          title="Drag to resize height"
        />
        <div
          className="emmu-resize-handle-corner"
          onPointerDown={(e) => handleResizeStart(e, 'se')}
          title="Drag to resize"
        />

        {/* TOP EMMU HEADER */}
        <div
          style={{
            padding: '12px 18px',
            background: '#075e54',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={avatarSrc}
              alt="Emmu"
              style={{ width: 32, height: 32, borderRadius: '50%', background: '#ffffff', padding: 2 }}
            />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Emmu Messenger</div>
              <div style={{ fontSize: 11, color: '#a7f3d0' }}>
                DYPIU Institutional Communication Hub
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* CONTEXTUAL ANALYTICS SUGGESTION SHORTCUT */}
            {isAnalyticsView && (
              <button
                type="button"
                onClick={() => setIsSuggestionComposerOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  borderRadius: 18,
                  padding: '4px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              >
                <Sparkles size={13} color="#fef08a" />
                <span>Drop Suggestion</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: 18,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
              }}
              title="Close Messenger"
            >
              ✕
            </button>
          </div>
        </div>

        {/* THREE MODE NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            background: '#008069',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            flexShrink: 0,
          }}
        >
          {/* TAB 1: CHATS */}
          <button
            type="button"
            onClick={() => setActiveTab('chats')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'chats' ? '#ffffff' : '#d1fae5',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderBottom: activeTab === 'chats' ? '3px solid #ffffff' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <MessageSquare size={16} />
            <span>Chats</span>
            {badges.unreadChats > 0 && (
              <span
                style={{
                  background: '#25d366',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {badges.unreadChats}
              </span>
            )}
          </button>

          {/* TAB 2: SUGGESTIONS */}
          <button
            type="button"
            onClick={() => setActiveTab('suggestions')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'suggestions' ? '#ffffff' : '#d1fae5',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderBottom: activeTab === 'suggestions' ? '3px solid #ffffff' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <Lightbulb size={16} />
            <span>Suggestions</span>
            {badges.unreadSuggestions > 0 && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {badges.unreadSuggestions}
              </span>
            )}
          </button>

          {/* TAB 3: NOTIFICATIONS */}
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'notifications' ? '#ffffff' : '#d1fae5',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderBottom: activeTab === 'notifications' ? '3px solid #ffffff' : '3px solid transparent',
              transition: 'all 0.15s',
            }}
          >
            <Bell size={16} />
            <span>Notifications</span>
            {badges.unreadNotifications > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
              >
                {badges.unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE TAB CONTENT */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {activeTab === 'chats' && (
            <div style={{ display: 'flex', height: '100%' }}>
              <WhatsAppConversationList
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={(id) => setActiveConversationId(id)}
                onOpenNewChat={() => setIsNewChatModalOpen(true)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                currentUserId={currentUserId}
              />
              <WhatsAppChatArea
                conversation={activeConversation}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
                isSending={isSendingMessage}
              />
            </div>
          )}

          {activeTab === 'suggestions' && (
            <SuggestionsHub
              onRefreshBadges={refreshBadges}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsHub
              onRefreshBadges={refreshBadges}
            />
          )}
        </div>

        {/* USER DIRECTORY SEARCH MODAL */}
        <WhatsAppUserDirectoryModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          onStartConversation={handleStartConversation}
        />

        {/* ANALYTICS SUGGESTION COMPOSER MODAL */}
        <AnalyticsSuggestionComposer
          isOpen={isSuggestionComposerOpen}
          onClose={() => setIsSuggestionComposerOpen(false)}
          academicContext={academicContext}
          onSuggestionSent={() => {
            refreshBadges();
            if (activeTab === 'suggestions') {
              // Trigger refresh inside SuggestionsHub
              setActiveTab('chats');
              setTimeout(() => setActiveTab('suggestions'), 50);
            }
          }}
        />
      </div>
    </div>
  );
}
