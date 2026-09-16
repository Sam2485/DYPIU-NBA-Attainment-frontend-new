import React, { useState, useEffect, useRef, useCallback } from 'react';
import { emmuSocket } from './services/chatSocket';
import { TypewriterQueue } from './services/typewriter';
import { PoppingText } from './PoppingText';
import './EmmuChatModal.css';

const INITIAL_MESSAGES = [
  {
    id: 'm1',
    sender: 'bot',
    text: 'Hello! I am Emmu, your IQAC Intelligence Assistant. 👋\nAsk me about PO/PSO attainment, curriculum trends, course gaps, or ATR actions.',
    time: '10:00 AM',
    initial: true,
    currency: 'LIVE',
  },
];

export default function EmmuChatModal({
  chatState = 'closed',
  cardRef,
  onClose,
  academicContext = null,
  setEmmuState,
}) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Resizable card dimensions
  const [cardSize, setCardSize] = useState({ width: 480, height: 640 });
  const [isResizing, setIsResizing] = useState(false);

  // Clipboard copy state
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Floating text selection & quoted context state
  const [selectionPopup, setSelectionPopup] = useState(null);
  const [quotedText, setQuotedText] = useState('');

  // Modern input card states & refs
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const modelMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  const idCounterRef = useRef(100);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typewriterRef = useRef(null);
  const avatarSrc = `${import.meta.env.BASE_URL}emmu_message.png`;

  const isOpen = chatState === 'open' || chatState === 'opening';
  const isCardVisible = chatState === 'open';

  const getNextId = (prefix) => `${prefix}-${++idCounterRef.current}`;

  const formatTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Initialize WebSocket and monitor connection status
  useEffect(() => {
    emmuSocket.connect();
    const unsubscribe = emmuSocket.onStatusChange((connected) => {
      setWsConnected(connected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (chatState === 'open') {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 50);
    }
  }, [chatState, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clean up typewriter on unmount
  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        typewriterRef.current.stop();
      }
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Text selection detection for "Ask Emmu" floating popup
  const handleSelectionCheck = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionPopup(null);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setSelectionPopup(null);
      return;
    }

    const container = messagesContainerRef.current;
    if (!container) return;

    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      setSelectionPopup(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setSelectionPopup({
      text,
      top: rect.top - containerRect.top + container.scrollTop - 44,
      left: Math.max(12, rect.left - containerRect.left + rect.width / 2 - 80),
    });
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelectionCheck, 20);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleSelectionCheck]);

  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => {
        setCopiedMsgId(null);
      }, 2000);
    } catch {
      // Fallback
    }
  };

  const handleAskEmmuFromSelection = (selectedText) => {
    setQuotedText(selectedText);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  const handleDirectElaborate = (selectedText) => {
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    handleSendMessage('', selectedText);
  };

  // Dynamic textarea height adjustment (1 line min, up to 4 lines stacked max)
  const adjustTextareaHeight = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const minH = 24;
    const maxH = 96;
    const scrollH = el.scrollHeight;
    const targetH = Math.min(Math.max(scrollH, minH), maxH);
    el.style.height = `${targetH}px`;
    el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      if (inputValue.trim() || quotedText) {
        handleSendMessage();
      }
    }
  };

  useEffect(() => {
    if (!showModelMenu) return;
    const handleClickOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setShowModelMenu(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showModelMenu]);

  // Speech-to-text recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv')
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        setInputValue((prev) =>
          prev
            ? `${prev}\n\n[Context: ${file.name}]\n${text}`
            : `[Context: ${file.name}]\n${text}`
        );
      };
      reader.readAsText(file);
    } else {
      setInputValue((prev) =>
        prev
          ? `${prev} [Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`
          : `[Attached: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`
      );
    }
    e.target.value = '';
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Resizing logic
  const handleResizeStart = (e, direction = 'se') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = cardSize.width;
    const startH = cardSize.height;

    const onPointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const minW = 360;
      const maxW = Math.min(window.innerWidth - 32, 1000);
      const minH = 420;
      const maxH = Math.min(window.innerHeight - 32, 920);

      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) {
        newW = Math.max(minW, Math.min(maxW, startW + deltaX));
      }
      if (direction.includes('s')) {
        newH = Math.max(minH, Math.min(maxH, startH + deltaY));
      }

      setCardSize({
        width: Math.round(newW),
        height: Math.round(newH),
      });
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const isStoppingRef = useRef(false);

  const handleStopGenerating = useCallback(() => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    try {
      emmuSocket.stop();
      if (typewriterRef.current) {
        typewriterRef.current.stop();
        typewriterRef.current = null;
      }

      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.isTyping || m.isThinking
            ? {
                ...m,
                isThinking: false,
                isTyping: false,
              }
            : m
        )
      );

      if (setEmmuState) setEmmuState('normal');
    } finally {
      setTimeout(() => {
        isStoppingRef.current = false;
      }, 100);
    }
  }, [setEmmuState]);

  // Check if query is an attempt to perform read-only mutations
  const checkReadOnlyIntent = (text) => {
    const lower = text.toLowerCase();
    const mutationKeywords = [
      'approve this atr',
      'approve all',
      'delete course',
      'delete this course',
      'delete department',
      'submit marks',
      'submit the report',
      'change target',
      'update mark',
    ];
    return mutationKeywords.some((kw) => lower.includes(kw));
  };

  const handleSendMessage = async (textOverride = null, quoteOverride = null) => {
    const rawInput = textOverride !== null ? textOverride : inputValue;
    const activeQuote = quoteOverride !== null ? quoteOverride : quotedText;
    const trimmedInput = rawInput.trim();

    if (!trimmedInput && !activeQuote) return;

    let promptToSend = '';
    let userDisplayText = '';
    let quoteSnippet = null;

    if (activeQuote) {
      quoteSnippet = activeQuote;
      if (trimmedInput) {
        promptToSend = `Regarding: "${activeQuote}"\n\n${trimmedInput}`;
        userDisplayText = trimmedInput;
      } else {
        promptToSend = `Please elaborate on this:\n"${activeQuote}"`;
        userDisplayText = `Please elaborate on this: "${activeQuote}"`;
      }
    } else {
      promptToSend = trimmedInput;
      userDisplayText = trimmedInput;
    }

    const userTime = formatTime();
    const userMsg = {
      id: getNextId('user'),
      sender: 'user',
      text: userDisplayText,
      quotedSnippet: quoteSnippet,
      time: userTime,
    };

    const botMsgId = getNextId('bot');

    // READ-ONLY GUARDRAIL: If user asks to perform an action/mutation, answer safely without mutation
    if (checkReadOnlyIntent(promptToSend)) {
      const readOnlyNotice = {
        id: botMsgId,
        sender: 'bot',
        text: 'Emmu is an analytical intelligence assistant with strictly read-only access. To approve ATRs, edit courses, or submit evaluations, please use the official action buttons directly in the OBE workflow screens.',
        time: userTime,
        currency: 'FINALIZED',
      };
      setMessages((prev) => [...prev, userMsg, readOnlyNotice]);
      setInputValue('');
      setQuotedText('');
      return;
    }

    const thinkingMsg = {
      id: botMsgId,
      sender: 'bot',
      isThinking: true,
      isTyping: false,
      text: '',
      time: userTime,
      currency: 'LIVE',
    };

    const historyPayload = messages
      .filter((m) => m.text && !m.isThinking)
      .slice(-10)
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = '24px';
      inputRef.current.style.overflowY = 'hidden';
    }
    setQuotedText('');
    setSelectionPopup(null);
    setIsGenerating(true);
    if (setEmmuState) setEmmuState('thinking');

    if (typewriterRef.current) {
      typewriterRef.current.stop();
    }

    // Initialize letter-by-letter popping typewriter
    const typewriter = new TypewriterQueue({
      onChar: (displayedText) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  isThinking: false,
                  isTyping: true,
                  text: displayedText,
                }
              : m
          )
        );
      },
      onComplete: () => {
        setIsGenerating(false);
        typewriterRef.current = null;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  isTyping: false,
                }
              : m
          )
        );
        if (setEmmuState) {
          setEmmuState('success');
          setTimeout(() => setEmmuState('normal'), 4000);
        }
      },
    });

    typewriterRef.current = typewriter;

    const handleIncomingToken = (token) => {
      typewriter.push(token);
    };

    const handleIncomingMetadata = (meta) => {
      if (meta?.currency || meta?.clarificationOptions) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  currency: meta.currency || m.currency,
                  clarificationOptions: meta.clarificationOptions || m.clarificationOptions,
                }
              : m
          )
        );
      }
    };

    const handleStreamComplete = () => {
      typewriter.finish();
    };

    const handleStreamError = (err) => {
      setIsGenerating(false);
      typewriter.stop();
      typewriterRef.current = null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                isThinking: false,
                isTyping: false,
                text: `I couldn't retrieve the OBE evidence right now (${err.message || 'connection issue'}). Please try again.`,
              }
            : m
        )
      );
      if (setEmmuState) {
        setEmmuState('error');
        setTimeout(() => setEmmuState('normal'), 3500);
      }
    };

    try {
      emmuSocket.sendChat({
        message: promptToSend,
        history: historyPayload,
        context: academicContext,
        onToken: handleIncomingToken,
        onMetadata: handleIncomingMetadata,
        onDone: handleStreamComplete,
        onError: handleStreamError,
        onStopped: () => {
          setIsGenerating(false);
        },
      });
    } catch (wsErr) {
      handleStreamError(wsErr);
    }
  };

  const handleSelectClarification = (optionText) => {
    handleSendMessage(optionText);
  };

  return (
    <div
      className={`emmu-chat-overlay ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Emmu Chat Assistant"
    >
      <div
        ref={cardRef}
        className={`emmu-chat-card ${isResizing ? 'is-resizing' : ''}`}
        style={{
          width: `${cardSize.width}px`,
          height: `${cardSize.height}px`,
          visibility: isCardVisible ? 'visible' : 'hidden',
          transform: 'none',
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
          title="Drag to resize chatbox"
        >
          <svg viewBox="0 0 16 16" fill="none" strokeWidth="1.6" strokeLinecap="round">
            <line x1="14" y1="6" x2="6" y2="14" />
            <line x1="14" y1="10" x2="10" y2="14" />
            <line x1="14" y1="14" x2="14" y2="14" />
          </svg>
        </div>

        {/* FLOATING TEXT SELECTION POPUP */}
        {selectionPopup && (
          <div
            className="emmu-selection-popup"
            style={{
              top: `${selectionPopup.top}px`,
              left: `${selectionPopup.left}px`,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <button
              type="button"
              className="emmu-selection-btn"
              onClick={() => handleAskEmmuFromSelection(selectionPopup.text)}
              title="Quote text and ask Emmu"
            >
              <span>Ask Emmu</span>
              <span>✨</span>
            </button>
            <button
              type="button"
              className="emmu-selection-btn elaborate"
              onClick={() => handleDirectElaborate(selectionPopup.text)}
              title="Quickly elaborate on selected text"
            >
              <span>Elaborate</span>
              <span>⚡</span>
            </button>
          </div>
        )}

        {/* HEADER - No model name or WS label in title as requested */}
        <div className="emmu-chat-header">
          <div className="emmu-chat-header-info">
            <img
              src={avatarSrc}
              alt="Emmu"
              className="emmu-chat-header-avatar"
            />
            <div>
              <div className="emmu-chat-header-title">Emmu</div>
              <div className={`emmu-chat-header-status ${wsConnected ? '' : 'offline'}`}>
                {wsConnected ? 'Online' : 'Reconnecting...'}
              </div>
            </div>
          </div>
          {/* ONLY the '✕' button closes the chat */}
          <button
            type="button"
            className="emmu-chat-close-btn"
            onClick={onClose}
            aria-label="Close Chat"
          >
            ✕
          </button>
        </div>

        {/* MESSAGES CONTAINER */}
        <div
          ref={messagesContainerRef}
          className="emmu-chat-messages"
          onScroll={() => {
            if (selectionPopup) setSelectionPopup(null);
          }}
        >
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="emmu-user-msg-row">
                  <div className="emmu-user-bubble">
                    {msg.quotedSnippet && (
                      <div className="emmu-user-quote-ref" title={msg.quotedSnippet}>
                        <span>❝</span>
                        <span>{msg.quotedSnippet}</span>
                      </div>
                    )}
                    <div className="emmu-user-text">{msg.text}</div>
                    <div className="emmu-user-meta">
                      <span>{msg.time}</span>
                      <span className="checks">✓✓</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Bot message
            return (
              <div key={msg.id} className="emmu-msg-row">
                <img
                  src={avatarSrc}
                  alt="Emmu"
                  className="emmu-msg-avatar"
                />
                <div className="emmu-msg-content-wrapper">
                  <div className="emmu-msg-header">
                    <span className="emmu-msg-author">Emmu</span>
                    <span className="emmu-msg-time">{msg.time}</span>
                  </div>

                  {/* Subtle Currency Display Badge */}
                  {msg.currency && !msg.isThinking && (
                    <div className={`emmu-currency-badge ${msg.currency.toLowerCase()}`}>
                      {msg.currency === 'LIVE' ? (
                        <>
                          <span className="badge-dot" />
                          <span>LIVE / CONTINUOUS MONITORING</span>
                        </>
                      ) : (
                        <span>FINALIZED / OFFICIAL HISTORICAL</span>
                      )}
                    </div>
                  )}

                  {msg.isThinking ? (
                    <div className="emmu-thinking-bubble">
                      <div className="emmu-dots">
                        <span className="emmu-dot"></span>
                        <span className="emmu-dot"></span>
                        <span className="emmu-dot"></span>
                      </div>
                      <span>Analyzing OBE attainment...</span>
                    </div>
                  ) : (
                    <>
                      <div className="emmu-bot-bubble">
                        <PoppingText text={msg.text} isAnimated={!msg.initial} />
                        {msg.isTyping && (
                          <span className="emmu-typing-cursor" aria-hidden="true" />
                        )}
                      </div>

                      {/* Clarification Chips if backend entity was ambiguous */}
                      {msg.clarificationOptions && msg.clarificationOptions.length > 0 && (
                        <div className="emmu-clarification-container">
                          {msg.clarificationOptions.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="emmu-clarification-chip"
                              onClick={() => handleSelectClarification(opt)}
                            >
                              <span>👉</span>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* COPY BUTTON */}
                      {msg.text && (
                        <div className="emmu-msg-actions">
                          <button
                            type="button"
                            className={`emmu-copy-btn ${copiedMsgId === msg.id ? 'copied' : ''}`}
                            onClick={() => handleCopyMessage(msg.id, msg.text)}
                            title="Copy response to clipboard"
                            aria-label="Copy response"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <span className="emmu-copy-label">Copied!</span>
                              </>
                            ) : (
                              <>
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                <span className="emmu-copy-label">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER & INPUT */}
        <div className="emmu-chat-footer">
          <form
            className="emmu-input-card"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            {/* QUOTED CONTEXT PREVIEW */}
            {quotedText && (
              <div className="emmu-quote-preview">
                <div className="emmu-quote-icon">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="emmu-quote-body">
                  <div className="emmu-quote-header">Quoting text to Emmu:</div>
                  <div className="emmu-quote-snippet">"{quotedText}"</div>
                </div>
                <button
                  type="button"
                  className="emmu-quote-cancel-btn"
                  onClick={() => setQuotedText('')}
                  title="Cancel quote"
                  aria-label="Cancel quote"
                >
                  ✕
                </button>
              </div>
            )}

            {/* AUTO-EXPANDING TEXTAREA (UP TO 4 LINES) */}
            <div className="emmu-textarea-wrapper">
              <textarea
                ref={inputRef}
                className="emmu-chat-textarea"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  quotedText
                    ? 'Add extra info (or press Enter to elaborate)...'
                    : 'Ask Emmu anything about IQAC attainment...'
                }
                rows={1}
                autoComplete="off"
              />
            </div>

            {/* ACTION ROW: + ON LEFT, MODEL / MIC / SEND ON RIGHT */}
            <div className="emmu-input-card-bottom">
              <div className="emmu-input-actions-left">
                <button
                  type="button"
                  className="emmu-input-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file or context"
                  aria-label="Attach file"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>

              <div className="emmu-input-actions-right">
                <div className="emmu-model-selector-wrapper" ref={modelMenuRef}>
                  <button
                    type="button"
                    className="emmu-model-badge"
                    onClick={() => setShowModelMenu((v) => !v)}
                    title="Active model: Llama 3.1 8B"
                  >
                    <span className="emmu-model-name">Llama 3.1 8B</span>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showModelMenu && (
                    <div className="emmu-model-dropdown">
                      <div className="emmu-model-dropdown-title">IQAC Intelligence Model</div>
                      <div className="emmu-model-item active">
                        <div className="emmu-model-item-dot" />
                        <div className="emmu-model-item-details">
                          <div className="emmu-model-item-name">Llama 3.1 (8B)</div>
                          <div className="emmu-model-item-desc">High-Factuality OBE Attainment</div>
                        </div>
                        <span className="emmu-model-item-check">✓</span>
                      </div>
                      <div className="emmu-model-dropdown-footer">
                        <span>Mode: Read-Only Intelligence</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={`emmu-input-mic-btn ${isListening ? 'listening' : ''}`}
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Listening... click to stop' : 'Voice input'}
                  aria-label="Voice input"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>

                {isGenerating ? (
                  <button
                    type="button"
                    className="emmu-send-btn stop"
                    onClick={handleStopGenerating}
                    aria-label="Pause response"
                    title="Pause response"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                      <rect x="5.5" y="4.5" width="4.5" height="15" rx="1.5" />
                      <rect x="14" y="4.5" width="4.5" height="15" rx="1.5" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="emmu-send-btn send"
                    aria-label="Send message"
                    disabled={!inputValue.trim() && !quotedText}
                    title="Send message"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="19" x2="12" y2="5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
