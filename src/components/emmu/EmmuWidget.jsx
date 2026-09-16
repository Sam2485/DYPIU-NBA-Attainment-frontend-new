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
      <div className="ask-label">Ask Emmu</div>

      {/* NOTIFICATION BADGE */}
      {notificationCount > 0 && (
        <div className="notification">{notificationCount}</div>
      )}

      {/* CIRCULAR PORTAL */}
      <div className="emmu-portal">
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
