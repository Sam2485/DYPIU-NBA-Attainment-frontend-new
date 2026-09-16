import React, { useState, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import EmmuWidget from './EmmuWidget';
import EmmuChatModal from './EmmuChatModal';
import GenieAnimation from './GenieAnimation';
import OffscreenChatPanel from './OffscreenChatPanel';

/**
 * IqacEmmuAssistant
 * Strictly renders for the authenticated 'IQAC' role across all IQAC screens.
 * When the user is NOT authenticated or possesses any other role, returns null.
 */
export default function IqacEmmuAssistant() {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();
  const academic = useAcademic();

  // Chat state: 'closed' | 'opening' | 'open' | 'closing'
  const [chatState, setChatState] = useState('closed');
  const [emmuState, setEmmuState] = useState('normal');

  // Live DOM node references for Three.js Genie animation
  const widgetRef = useRef(null);
  const chatCardRef = useRef(null);

  // Derive current academic UI context safely to pass to Spring Boot /ws/chat
  const academicContext = useMemo(() => {
    return {
      role: 'IQAC',
      username: user?.username || null,
      pathname: location.pathname,
      schoolId: academic?.selectedSchoolId || user?.schoolId || null,
      schoolName: academic?.selectedSchool?.name || user?.schoolName || null,
      departmentId: academic?.selectedDepartmentId || null,
      departmentName: academic?.selectedDepartment?.name || null,
      programmeId: academic?.selectedProgramme?.id || null,
      programmeName: academic?.selectedProgramme?.name || null,
      batchId: academic?.selectedBatch?.id || null,
      batchName: academic?.selectedBatch?.name || null,
      courseId: academic?.selectedCourse?.id || null,
      courseName: academic?.selectedCourse?.name || null,
    };
  }, [academic, location.pathname, user]);

  // Strictly restricted to IQAC role only
  if (!isAuthenticated || role !== 'IQAC') {
    return null;
  }

  const handleOpenChat = () => {
    if (chatState !== 'closed') return;
    setChatState('opening');
    setEmmuState('normal');
  };

  const handleCloseChat = () => {
    if (chatState !== 'open') return;
    setChatState('closing');
    setEmmuState('normal');
  };

  const handleGenieComplete = (completedState) => {
    if (completedState === 'opening') {
      setChatState('open');
    } else if (completedState === 'closing') {
      setChatState('closed');
    }
  };

  return (
    <>
      {/* DRAGGABLE EMMU MASCOT WIDGET (SOURCE FOR GENIE) */}
      <EmmuWidget
        ref={widgetRef}
        emmuState={emmuState}
        onOpenChat={handleOpenChat}
        notificationCount={0}
        speechMessage="Ask me about IQAC OBE attainment"
        showNotification={false}
        isChatOpen={chatState === 'open' || chatState === 'opening'}
      />

      {/* CENTERED EMMU CHAT MODAL (DESTINATION FOR GENIE) */}
      <EmmuChatModal
        chatState={chatState}
        cardRef={chatCardRef}
        onClose={handleCloseChat}
        academicContext={academicContext}
        setEmmuState={setEmmuState}
      />

      {/* THREE.JS WEBGL 3D GENIE ANIMATION LAYER */}
      <GenieAnimation
        sourceRef={widgetRef}
        destinationRef={chatCardRef}
        chatState={chatState}
        onAnimationComplete={handleGenieComplete}
      />

      {/* OFFSCREEN TEXTURE PRE-WARMING */}
      <OffscreenChatPanel />
    </>
  );
}
