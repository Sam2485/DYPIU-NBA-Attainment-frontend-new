import React from 'react';

export default function EmmuEyes() {
  return (
    <div className="emmu-eyes" id="emmuEyes">
      {/* LEFT EYE */}
      <svg
        className="emmu-eye eye-left"
        viewBox="0 0 100 60"
        aria-hidden="true"
      >
        <path className="normal-path" d="M 12 42 Q 50 2 88 42" />
        <path className="success-path" d="M 18 30 L 40 48 L 82 14" />
        <path className="error-path" d="M 24 14 L 76 46 M 76 14 L 24 46" />
        <circle className="loading-ring" cx="50" cy="30" r="20" />
      </svg>

      {/* RIGHT EYE */}
      <svg
        className="emmu-eye eye-right"
        viewBox="0 0 100 60"
        aria-hidden="true"
      >
        <path className="normal-path" d="M 12 42 Q 50 2 88 42" />
        <path className="success-path" d="M 18 30 L 40 48 L 82 14" />
        <path className="error-path" d="M 24 14 L 76 46 M 76 14 L 24 46" />
        <circle className="loading-ring" cx="50" cy="30" r="20" />
      </svg>
    </div>
  );
}
