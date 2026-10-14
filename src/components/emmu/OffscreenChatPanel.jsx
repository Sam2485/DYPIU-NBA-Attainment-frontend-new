import React, { useEffect, useRef, useState } from 'react';
import genieTextureCache from './GenieTextureCache';
import { MessageSquare, Lightbulb, Bell, Search, CheckCheck } from 'lucide-react';
import './EmmuChatModal.css';

export default function OffscreenChatPanel() {
  const offscreenRef = useRef(null);
  const avatarSrc = `${import.meta.env.BASE_URL}emmu_message.png`;

  const [panelSize] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nba_emmu_card_size') || '{}');
      if (saved.width && saved.height) return saved;
    } catch (e) {}
    return { width: 760, height: 620 };
  });

  useEffect(() => {
    if (!offscreenRef.current) return;

    let isCancelled = false;

    const prewarmTexture = async () => {
      if (isCancelled || !offscreenRef.current) return;

      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch {
          // Continue if font check errors
        }
      }
      if (isCancelled || !offscreenRef.current) return;

      // Wait two frames for layout to settle
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );
      if (isCancelled || !offscreenRef.current) return;

      await genieTextureCache.captureElement(offscreenRef.current, 'chat');
    };

    // Idle schedule
    if (typeof requestIdleCallback === 'function') {
      const idleId = requestIdleCallback(() => prewarmTexture(), {
        timeout: 1000,
      });
      return () => {
        isCancelled = true;
        cancelIdleCallback(idleId);
      };
    } else {
      const timer = setTimeout(prewarmTexture, 150);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: '-10000px',
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
        pointerEvents: 'none',
        zIndex: -9999,
        visibility: 'visible',
      }}
    >
      <div
        ref={offscreenRef}
        style={{
          width: `${panelSize.width}px`,
          height: `${panelSize.height}px`,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {/* TOP HEADER */}
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
          <div style={{ color: '#ffffff', opacity: 0.7, fontSize: 18 }}>✕</div>
        </div>

        {/* NAVIGATION TABS */}
        <div
          style={{
            background: '#f0f2f5',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 800,
              background: '#ffffff',
              color: '#075e54',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <MessageSquare size={14} />
            <span>Chats</span>
          </div>

          <div
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Lightbulb size={14} />
            <span>Suggestions</span>
          </div>

          <div
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Bell size={14} />
            <span>Notifications</span>
          </div>
        </div>

        {/* BODY: SPLIT CHAT LAYOUT */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
          {/* SIDEBAR */}
          <div
            style={{
              width: 270,
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
            }}
          >
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f0f2f5',
                  borderRadius: 8,
                  padding: '6px 10px',
                  gap: 8,
                  color: '#94a3b8',
                  fontSize: 12,
                }}
              >
                <Search size={14} />
                <span>Search or start new chat</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: '6px 8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#075e54',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  DA
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Director Academics</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>ATR submitted for review</div>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT AREA */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: '#efeae2',
              padding: 16,
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '4px 14px 14px 14px',
                  fontSize: 13,
                  color: '#1e293b',
                  maxWidth: '70%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Please verify the CO attainment values for Batch 2023.
                <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>10:45 AM</div>
              </div>

              <div
                style={{
                  alignSelf: 'flex-end',
                  background: '#d9fdd3',
                  padding: '8px 14px',
                  borderRadius: '14px 4px 14px 14px',
                  fontSize: 13,
                  color: '#1e293b',
                  maxWidth: '70%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Reviewed and verified successfully.
                <div
                  style={{
                    fontSize: 10,
                    color: '#53bdeb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 3,
                    marginTop: 4,
                  }}
                >
                  <span>10:48 AM</span>
                  <CheckCheck size={12} />
                </div>
              </div>
            </div>

            {/* COMPOSER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: 24,
                padding: '8px 16px',
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Type an encrypted message...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
