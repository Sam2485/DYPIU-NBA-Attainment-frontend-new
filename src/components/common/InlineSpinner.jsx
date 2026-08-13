export function InlineSpinner({ label = "Loading..." }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        marginRight: "6px",
        verticalAlign: "middle",
      }}
      aria-label={label}
    >
      <svg
        style={{
          width: "16px",
          height: "16px",
          animation: "dyp-spin 0.8s linear infinite",
        }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeDasharray="31.4 31.4"
          opacity="0.25"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12C2 14.246 2.74127 16.319 4 18"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
      <style>{`
        @keyframes dyp-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}

export default InlineSpinner;
