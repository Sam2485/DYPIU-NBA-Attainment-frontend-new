import { useEffect, useRef, useState } from 'react';
import AccountPanelSection from './AccountPanelSection';
import genieTextureCache from './GenieTextureCache';

/**
 * Offscreen preparation component that pre-warms the Account Panel textures
 * into GenieTextureCache sequentially during idle browser periods on page load.
 *
 * CRITICAL LAYOUT SYNCHRONIZATION:
 * The offscreen wrapper uses the exact same workspace width/padding/grid environment
 * as UserProfileModal so that the rendered panel dimensions, font metrics, and
 * component layout are pixel-for-pixel identical to the live modal DOM.
 */
export default function OffscreenAccountPanel({
  user,
  roleLabel,
  courseCount = 0,
  batchName,
}) {
  const offscreenRef = useRef(null);
  const [tab, setTab] = useState('profile');
  const [preferences] = useState({
    workflow: true,
    course: true,
    atr: true,
    approval: true,
    email: true,
    inApp: true,
    compact: false,
    reducedMotion: false,
  });

  useEffect(() => {
    if (!offscreenRef.current) return;

    let isCancelled = false;
    const tabQueue = ['profile', 'security', 'notifications', 'settings'];
    let queueIdx = 0;

    const processNextTab = async () => {
      if (isCancelled || queueIdx >= tabQueue.length) return;

      // Ensure web fonts (Inter) are fully loaded and active before first rasterization
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (e) {
          // Ignore font error and continue
        }
      }
      if (isCancelled || !offscreenRef.current) return;

      const targetTab = tabQueue[queueIdx++];
      setTab(targetTab);

      // Wait two frames for React to commit offscreen layout and paint
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      if (isCancelled || !offscreenRef.current) return;

      await genieTextureCache.captureElement(offscreenRef.current, targetTab);

      // Schedule next tab quickly during idle periods so all 4 tabs are ready
      if (!isCancelled && queueIdx < tabQueue.length) {
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(() => processNextTab(), { timeout: 500 });
        } else {
          setTimeout(processNextTab, 60);
        }
      }
    };

    // Begin idle pre-warming after dashboard has settled
    const initialTimer = setTimeout(() => {
      processNextTab();
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
    };
  }, [user, roleLabel, courseCount, batchName]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: '-10000px', // offscreen
        width: 'calc(100vw - 280px)',
        padding: '20px 148px 20px 24px',
        display: 'grid',
        placeItems: 'center',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: -100,
        visibility: 'visible',
      }}
    >
      <AccountPanelSection
        accountPanelRef={offscreenRef}
        tab={tab}
        setTab={() => {}}
        preferences={preferences}
        setPreferences={() => {}}
        onClose={() => {}}
        user={user}
        roleLabel={roleLabel}
        courseCount={courseCount}
        batchName={batchName}
        style={{
          transform: 'translateX(60px)',
        }}
      />
    </div>
  );
}
