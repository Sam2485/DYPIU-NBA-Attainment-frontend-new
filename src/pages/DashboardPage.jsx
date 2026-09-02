import { useEffect, useRef, useState } from 'react';

import AppHeader from '../components/layout/AppHeader';
import AppSidebar from '../components/layout/AppSidebar';

import DashboardOverview from '../features/dashboard/DashboardOverview';
import DirectorDashboard from '../features/director/DirectorDashboard';
import HodDashboard from '../features/hod/HodDashboard';
import ProgrammeCoordinatorDashboard from '../features/programme-coordinator/ProgrammeCoordinatorDashboard';

import UserProfileModal from '../components/profile/UserProfileModal';
import GenieAnimation from '../components/profile/GenieAnimation';
import OffscreenAccountPanel from '../components/profile/OffscreenAccountPanel';

import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { role, user } = useAuth();

  /*
   * ============================================================
   * PROFILE / GENIE ANIMATION FOUNDATION
   * ============================================================
   *
   * These refs identify the two physical endpoints of the
   * future Genie animation:
   *
   * profileCardRef   -> sidebar profile card
   * accountPanelRef  -> actual Account panel
   *
   * IMPORTANT:
   * We do not hard-code coordinates.
   * The future Three.js animation will use
   * getBoundingClientRect() on these elements.
   */

  const profileCardRef = useRef(null);
  const accountPanelRef = useRef(null);

  /*
   * Profile state:
   *
   * closed
   * opening
   * open
   * closing
   *
   * For now we only use closed/open.
   * The opening/closing states are deliberately introduced
   * because the Genie animation will use them later.
   */

  const [profileState, setProfileState] = useState('closed');
  const [activeTab, setActiveTab] = useState('profile');

  const isProfileOpen =
    profileState === 'open' ||
    profileState === 'opening' ||
    profileState === 'closing';

  const openProfile = () => {
    if (profileState !== 'closed') {
      return;
    }
    setProfileState('opening');
  };

  const closeProfile = () => {
    if (profileState !== 'open') {
      return;
    }
    setProfileState('closing');
  };

  const handleGenieComplete = (completedState) => {
    if (completedState === 'opening') {
      setProfileState('open');
    } else if (completedState === 'closing') {
      setProfileState('closed');
    }
  };

  const roleText =
    role === 'DIRECTOR'
      ? 'Director'
      : role === 'HOD'
        ? 'Head of Department'
        : role === 'PROGRAMME_COORDINATOR'
          ? 'Programme Coordinator'
          : 'Academic User';

  /*
   * Keep the existing application layout.
   */

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <AppSidebar
        profileCardRef={profileCardRef}
        isProfileOpen={isProfileOpen}
        onProfileOpen={openProfile}
      />

      {/* ======================================================
          WORKSPACE
          ====================================================== */}

      <main
        className="nba-layout-main"
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <AppHeader
          title={
            role === 'DIRECTOR'
              ? 'Director Overview & Actions'
              : role === 'HOD'
                ? 'HOD Overview & Actions'
                : role === 'PROGRAMME_COORDINATOR'
                  ? 'Programme Coordinator Overview & Actions'
                  : 'NBA Attainment Overview'
          }
          subtitle="D. Y. Patil International University"
        />

        <div className="page-container">
          {role === 'DIRECTOR' ? (
            <DirectorDashboard />
          ) : role === 'HOD' ? (
            <HodDashboard />
          ) : role === 'PROGRAMME_COORDINATOR' ? (
            <ProgrammeCoordinatorDashboard />
          ) : (
            <DashboardOverview />
          )}
        </div>

        {/* ====================================================
            WORKSPACE BACKDROP

            IMPORTANT:
            This lives INSIDE <main>, not around the entire app.

            Therefore the sidebar is automatically excluded.

            Later the Genie canvas will also live here.
            ==================================================== */}

        {isProfileOpen && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,

              /*
               * Sidebar is 280px wide.
               *
               * We intentionally keep this outside the sidebar.
               */
              left: 280,

              zIndex: 190,

              background: 'rgba(15, 23, 42, 0.20)',

              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',

              pointerEvents: 'none',

              transition:
                'opacity 180ms ease, backdrop-filter 180ms ease',

              opacity: isProfileOpen ? 1 : 0,
            }}
          />
        )}
      </main>

      {/* ======================================================
          PROFILE PANEL
          ====================================================== */}

      <UserProfileModal
        open={isProfileOpen}
        profileState={profileState}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={closeProfile}
        user={user}
        roleLabel={roleText}
        accountPanelRef={accountPanelRef}
      />

      {/* ======================================================
          GENIE ANIMATION LAYER (PHASE 3)
          ====================================================== */}

      <GenieAnimation
        sourceRef={profileCardRef}
        destinationRef={accountPanelRef}
        profileState={profileState}
        activeTab={activeTab}
        onAnimationComplete={handleGenieComplete}
      />

      {/* ======================================================
          OFFSCREEN TEXTURE PREPARATION (PHASE 5)
          Pre-rasterizes the Account Panel during idle time so
          the Genie animation starts immediately on click with 0ms delay.
          ====================================================== */}
      <OffscreenAccountPanel
        user={user}
        roleLabel={roleText}
      />
    </div>
  );
}
