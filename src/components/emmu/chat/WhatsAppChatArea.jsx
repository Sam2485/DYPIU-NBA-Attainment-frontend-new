import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { decryptMessage } from '../services/crypto';

export default function WhatsAppChatArea({
  conversation,
  messages = [],
  onSendMessage,
  onBack,
  currentUserId,
  isSending = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Decrypt incoming messages transparently
  useEffect(() => {
    let isMounted = true;
    const decryptAll = async () => {
      if (!conversation?.id || !messages.length) {
        if (isMounted) setDecryptedMessages([]);
        return;
      }

      const results = await Promise.all(
        messages.map(async (m) => {
          if (m.isEncrypted && m.iv) {
            const plain = await decryptMessage(m.content, m.iv, conversation.id);
            return { ...m, displayContent: plain };
          }
          return { ...m, displayContent: m.content };
        })
      );

      if (isMounted) {
        setDecryptedMessages(results);
      }
    };

    decryptAll();
    return () => {
      isMounted = false;
    };
  }, [messages, conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptedMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isSending) return;
    onSendMessage(text);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatBubbleTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
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

  if (!conversation) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f2f5',
          color: '#667781',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(37, 211, 102, 0.12)',
            color: '#25d366',
            display: 'grid',
            placeItems: 'center',
            marginBottom: 16,
          }}
        >
          <Lock size={32} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#111b21', marginBottom: 6 }}>
          Emmu Institutional Messenger
        </div>
        <div style={{ fontSize: 13, maxWidth: 360, lineHeight: 1.5 }}>
          Select a chat from the sidebar or start a new direct conversation. Messages are secured with end-to-end encryption.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#efeae2',
        position: 'relative',
      }}
    >
      {/* WHATSAPP CHAT HEADER */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f0f2f5',
          borderBottom: '1px solid #d1d7db',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#54656f',
              padding: 4,
            }}
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: getRoleBadgeColor(conversation.peerRole),
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {(conversation.peerName || 'U').charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#111b21', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {conversation.peerName || 'User'}
          </div>
          <div style={{ fontSize: 11, color: '#667781', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                background: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                padding: '1px 5px',
                borderRadius: 4,
                fontSize: 9.5,
                fontWeight: 700,
              }}
            >
              {conversation.peerRole || 'MEMBER'}
            </span>
            <span>• End-to-End Encrypted</span>
            <Lock size={10} color="#059669" />
          </div>
        </div>
      </div>

      {/* WHATSAPP MESSAGE BUBBLE FEED */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(239,234,226,0.8) 100%)',
        }}
      >
        {/* E2EE NOTICE BANNER */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 12px' }}>
          <div
            style={{
              background: '#ffeecd',
              color: '#54656f',
              fontSize: 11.5,
              padding: '6px 14px',
              borderRadius: 8,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              maxWidth: 420,
              textAlign: 'center',
            }}
          >
            <Lock size={13} color="#b45309" />
            <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
          </div>
        </div>

        {decryptedMessages.map((m) => {
          const isOutgoing = m.senderId === currentUserId;
          const isSeen = Boolean(m.readAt);

          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: isOutgoing ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  background: isOutgoing ? '#d9fdd3' : '#ffffff',
                  color: '#111b21',
                  borderRadius: isOutgoing ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                  padding: '7px 10px 5px 12px',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
                  wordBreak: 'break-word',
                  fontSize: 13.5,
                  lineHeight: 1.4,
                  position: 'relative',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.displayContent || m.content}</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 3,
                    marginTop: 3,
                    fontSize: 10.5,
                    color: '#667781',
                    float: 'right',
                    marginLeft: 12,
                  }}
                >
                  <span>{formatBubbleTime(m.createdAt)}</span>
                  {isOutgoing && (
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {isSeen ? (
                        <CheckCheck size={14} color="#53bdeb" title="Seen" />
                      ) : (
                        <CheckCheck size={14} color="#8696a0" title="Delivered" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* WHATSAPP BOTTOM COMPOSER */}
      <div
        style={{
          padding: '10px 16px',
          background: '#f0f2f5',
          borderTop: '1px solid #d1d7db',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#ffffff',
            borderRadius: 24,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13.5,
              color: '#111b21',
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          title="Send message"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: inputValue.trim() ? '#25d366' : '#cbd5e1',
            border: 'none',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <Send size={18} style={{ marginLeft: 2 }} />
        </button>
      </div>
    </div>
  );
}
