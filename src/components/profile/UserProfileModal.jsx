import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AccountPanelSection from './AccountPanelSection';
import genieTextureCache from './GenieTextureCache';

export default function UserProfileModal({
  open,
  profileState,
  activeTab,
  onTabChange,
  onClose,
  user,
  roleLabel,
  courseCount = 0,
  batchName,
  accountPanelRef,
}) {
  // Authoritative active tab from DashboardPage: first render directly matches destination tab
  const currentTab = activeTab || 'profile';

  const [preferences, setPreferences] = useState({
    workflow: true,
    course: true,
    atr: true,
    approval: true,
    email: true,
    inApp: true,
    compact: false,
    reducedMotion: false,
  });

  // Handle ESC key to close
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Pure React UI state: tab changes update the DOM immediately with zero background rasterization
  const handleSelectTab = useCallback(
    (newTab) => {
      onTabChange?.(newTab);
      genieTextureCache.setLatestTab(newTab);
    },
    [onTabChange]
  );

  // Stable preference toggle
  const handleTogglePreference = useCallback((key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!open) return null;

  const isModalVisuallyActive = profileState === 'open';

  const content = (
    <div
      role="presentation"
      onMouseDown={onClose}
      style={{
        position: 'fixed',

        /*
         * IMPORTANT:
         * Do NOT cover the sidebar.
         */
        top: 0,
        right: 0,
        bottom: 0,
        left: 280,

        zIndex: 200,

        padding: '20px 148px 20px 24px',

        display: 'grid',
        placeItems: 'center',

        background: 'rgba(15, 23, 42, .16)',

        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',

        transition: 'opacity 180ms ease, backdrop-filter 180ms ease',
        pointerEvents: isModalVisuallyActive ? 'auto' : 'none',
      }}
    >
      <AccountPanelSection
        accountPanelRef={accountPanelRef}
        tab={currentTab}
        setTab={handleSelectTab}
        preferences={preferences}
        onTogglePreference={handleTogglePreference}
        onClose={onClose}
        user={user}
        roleLabel={roleLabel}
        courseCount={courseCount}
        batchName={batchName}
        style={{
          transform: 'translateX(60px)',
          // Instant visibility toggle: no opacity transition to prevent intermediate frame flicker
          visibility: isModalVisuallyActive ? 'visible' : 'hidden',
          pointerEvents: isModalVisuallyActive ? 'auto' : 'none',
        }}
      />
    </div>
  );

  return createPortal(content, document.body);
}
