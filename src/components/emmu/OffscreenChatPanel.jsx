import React, { useEffect, useRef } from 'react';
import genieTextureCache from './GenieTextureCache';
import './EmmuChatModal.css';

export default function OffscreenChatPanel() {
  const offscreenRef = useRef(null);
  const avatarSrc = `${import.meta.env.BASE_URL}emmu_message.png`;

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
        width: '480px',
        height: '640px',
        pointerEvents: 'none',
        zIndex: -9999,
        visibility: 'visible',
      }}
    >
      <div ref={offscreenRef} className="emmu-chat-card" style={{ transform: 'none' }}>
        {/* HEADER */}
        <div className="emmu-chat-header">
          <div className="emmu-chat-header-info">
            <img
              src={avatarSrc}
              alt="Emmu"
              className="emmu-chat-header-avatar"
            />
            <div>
              <div className="emmu-chat-header-title">Emmu</div>
              <div className="emmu-chat-header-status">Online</div>
            </div>
          </div>
          <button type="button" className="emmu-chat-close-btn">
            ✕
          </button>
        </div>

        {/* MESSAGES */}
        <div className="emmu-chat-messages">
          <div className="emmu-msg-row">
            <img
              src={avatarSrc}
              alt="Emmu"
              className="emmu-msg-avatar"
            />
            <div className="emmu-msg-content-wrapper">
              <div className="emmu-msg-header">
                <span className="emmu-msg-author">Emmu</span>
                <span className="emmu-msg-time">10:24 AM</span>
              </div>
              <div className="emmu-bot-bubble">
                Hi there! 👋<br />How can I help you today?
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="emmu-chat-footer">
          <div className="emmu-input-card">
            <div className="emmu-textarea-wrapper">
              <div className="emmu-chat-textarea" style={{ height: '24px', opacity: 0.6 }}>
                Ask Emmu anything...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
