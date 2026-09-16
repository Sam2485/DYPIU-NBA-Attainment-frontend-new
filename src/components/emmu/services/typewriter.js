/**
 * Smooth letter-by-letter AI typewriter animation queue
 * Buffers incoming token chunks from LLM/WebSocket and continuously
 * renders them character-by-character without stopping between words.
 */
export class TypewriterQueue {
  constructor({ onChar, onComplete }) {
    this.onChar = onChar;
    this.onComplete = onComplete;
    this.charQueue = [];
    this.displayedText = '';
    this.isFinished = false;
    this.timerId = null;
    this.isStopped = false;
    this.hasStarted = false;
    this.startTimeout = null;
  }

  /**
   * Add a new token chunk from LLM / WebSocket
   */
  push(token) {
    if (this.isStopped || !token) return;

    // Split token into individual unicode characters
    const chars = Array.from(token);
    for (let i = 0; i < chars.length; i++) {
      this.charQueue.push(chars[i]);
    }

    if (!this.hasStarted) {
      // Pre-buffer a slight runway (6-8 chars or 35ms) so response never stops between words
      if (this.charQueue.length >= 8 || this.isFinished) {
        this.startTyping();
      } else if (!this.startTimeout) {
        this.startTimeout = setTimeout(() => {
          this.startTyping();
        }, 35);
      }
    } else if (!this.timerId) {
      this.tick();
    }
  }

  startTyping() {
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }
    if (this.isStopped || this.hasStarted) return;
    this.hasStarted = true;
    this.tick();
  }

  /**
   * Signal that backend has completed sending tokens
   */
  finish() {
    this.isFinished = true;
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }
    this.hasStarted = true;
    if (!this.timerId) {
      if (this.charQueue.length === 0) {
        this.onComplete?.(this.displayedText);
      } else {
        this.tick();
      }
    }
  }

  /**
   * Immediately abort and cancel typing
   */
  stop() {
    this.isStopped = true;
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.charQueue = [];
  }

  /**
   * Flush all remaining characters immediately
   */
  flush() {
    if (this.startTimeout) {
      clearTimeout(this.startTimeout);
      this.startTimeout = null;
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    while (this.charQueue.length > 0) {
      this.displayedText += this.charQueue.shift();
    }
    this.onChar?.(this.displayedText);
    this.onComplete?.(this.displayedText);
  }

  tick = () => {
    if (this.isStopped) return;

    if (this.charQueue.length === 0) {
      this.timerId = null;
      if (this.isFinished) {
        this.onComplete?.(this.displayedText);
      }
      return;
    }

    // Always take exactly 1 character so every single letter gets its 1.5x down-pop
    const nextChar = this.charQueue.shift();
    this.displayedText += nextChar;
    this.onChar?.(this.displayedText);

    if (this.charQueue.length === 0 && this.isFinished) {
      this.timerId = null;
      this.onComplete?.(this.displayedText);
      return;
    }

    // Elastic adaptive pacing:
    // Paces dynamically so the buffer never empties prematurely between LLM chunks
    const remaining = this.charQueue.length;
    let delay = 10; // steady baseline ~100 chars/sec

    if (this.isFinished) {
      delay = 7; // drain finishing buffer quickly
    } else if (remaining >= 25) {
      delay = 7; // drain fast bursts
    } else if (remaining >= 12) {
      delay = 9;
    } else if (remaining >= 5) {
      delay = 11;
    } else {
      // 1 to 4 chars left: smooth glide to bridge the gap until next token packet
      delay = 15;
    }

    this.timerId = setTimeout(this.tick, delay);
  };
}
