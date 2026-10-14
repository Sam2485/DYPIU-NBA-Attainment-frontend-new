import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import EmmuEyes from './EmmuEyes';
import './EmmuWidget.css';

const EmmuWidget = forwardRef(function EmmuWidget(
  {
    emmuState = 'normal',
    onOpenChat,
    notificationCount = 0,
    speechMessage = '',
    showNotification = false,
    isChatOpen = false,
    launcherStyle = 'emmu', // 'emmu' | 'messenger'
    transparentBg = false,
  },
  ref
) {
  const widgetRef = useRef(null);

  useImperativeHandle(ref, () => widgetRef.current);

  // Position state: null means default bottom/right from CSS
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [flipSpeech, setFlipSpeech] = useState(false);
  const [flipLabel, setFlipLabel] = useState(false);

  // Drag tracking refs
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, elemX: 0, elemY: 0 });
  const hasDraggedRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const peekTimerRef = useRef(null);

  const emmuImageSrc = `${import.meta.env.BASE_URL}emmu.png`;

  // Clamp helper
  const clampPosition = (x, y) => {
    if (!widgetRef.current) return { x, y };
    const width = widgetRef.current.offsetWidth || 120;
    const height = widgetRef.current.offsetHeight || 120;
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    const clampedX = Math.max(0, Math.min(maxX, x));
    const clampedY = Math.max(0, Math.min(maxY, y));

    setFlipSpeech(clampedX < 230);
    setFlipLabel(clampedY < 120);

    return { x: clampedX, y: clampedY };
  };

  // Re-clamp on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        return clampPosition(prev.x, prev.y);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer Down
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    const rect = widgetRef.current.getBoundingClientRect();
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      elemX: rect.left,
      elemY: rect.top,
    };
    hasDraggedRef.current = false;
    isPointerDownRef.current = true;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if already captured
    }
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return;

    const dx = e.clientX - dragStartRef.current.pointerX;
    const dy = e.clientY - dragStartRef.current.pointerY;

    if (!hasDraggedRef.current && Math.hypot(dx, dy) > 5) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }

    if (hasDraggedRef.current) {
      const newPos = clampPosition(
        dragStartRef.current.elemX + dx,
        dragStartRef.current.elemY + dy
      );
      setPosition(newPos);
    }
  };

  // Pointer Up / Cancel
  const handlePointerEnd = (e) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
  };

  // Click Trigger
  const handleClick = () => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    triggerPeek();
    if (onOpenChat) {
      onOpenChat();
    }
  };

  // Temporary Peek Trigger
  const triggerPeek = (duration = 3500) => {
    setIsPeeking(true);
    if (peekTimerRef.current) clearTimeout(peekTimerRef.current);
    peekTimerRef.current = setTimeout(() => {
      setIsPeeking(false);
    }, duration);
  };

  // Style positioning calculation
  const widgetStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto',
        bottom: 'auto',
      }
    : {
        right: '28px',
        bottom: '28px',
      };

  const widgetClassNames = [
    'emmu-widget',
    emmuState,
    isDragging ? 'dragging' : '',
    isPeeking ? 'peek' : '',
    isChatOpen ? 'chat-open' : '',
    showNotification && notificationCount > 0 ? 'notification-active' : '',
    flipSpeech ? 'flip-speech' : '',
    flipLabel ? 'flip-label-bottom' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (launcherStyle === 'messenger') {
    return (
      <div
        ref={widgetRef}
        style={{
          ...widgetStyle,
          position: 'fixed',
          zIndex: 100005,
          cursor: 'pointer',
        }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Open Institutional Messenger"
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #075e54 0%, #128c7e 100%)',
            boxShadow: '0 8px 24px rgba(7, 94, 84, 0.35)',
            display: 'grid',
            placeItems: 'center',
            color: '#ffffff',
            position: 'relative',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {notificationCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                background: '#25d366',
                color: '#ffffff',
                borderRadius: 12,
                minWidth: 20,
                height: 20,
                padding: '0 5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
            >
              {notificationCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      className={widgetClassNames}
      style={widgetStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
      onDragStart={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      aria-label="Open Emmu Chatbot"
    >
      {/* SPEECH BUBBLE */}
      {speechMessage && <div className="speech">{speechMessage}</div>}

      {/* ASK EMMU LABEL */}
      <div className="ask-label">{notificationCount > 0 ? `Messages (${notificationCount})` : 'Emmu'}</div>

      {/* NOTIFICATION BADGE */}
      {notificationCount > 0 && (
        <div className="notification">{notificationCount}</div>
      )}

      {/* CIRCULAR PORTAL (SUPPORTS TRANSPARENT BACKGROUND) */}
      <div
        className="emmu-portal"
        style={transparentBg ? { background: 'transparent', border: 'none', boxShadow: 'none' } : undefined}
      >
        <div className="emmu" id="emmu">
          {/* BASE PNG */}
          <img
            src={emmuImageSrc}
            alt="Emmu Character"
            className="emmu-image"
            draggable="false"
          />

          {/* EYES */}
          <EmmuEyes />
        </div>
      </div>
    </div>
  );
});

export default EmmuWidget;
