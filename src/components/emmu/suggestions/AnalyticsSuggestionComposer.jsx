import React, { useState } from 'react';
import { Lightbulb, Send, X, AlertCircle } from 'lucide-react';
import { messengerApi } from '../services/messengerApi';

export default function AnalyticsSuggestionComposer({
  isOpen,
  onClose,
  academicContext = {},
  onSuggestionSent,
}) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ATTAINMENT_GAP');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isCourseContext = Boolean(academicContext?.programmeBatchCourseId || academicContext?.courseId);
  const targetRoleTitle = isCourseContext
    ? 'Assigned Course Coordinator'
    : 'Assigned Programme Coordinator';

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await messengerApi.createSuggestion({
        schoolId: academicContext?.schoolId || null,
        departmentId: academicContext?.departmentId || null,
        masterProgrammeId: academicContext?.programmeId || academicContext?.masterProgrammeId || null,
        programmeBatchId: academicContext?.batchId || academicContext?.programmeBatchId || null,
        programmeBatchCourseId: academicContext?.courseId || academicContext?.programmeBatchCourseId || null,
        contextType: isCourseContext ? 'COURSE' : 'PROGRAMME_BATCH',
        category,
        content: content.trim(),
      });

      setSuccessMsg('Suggestion sent successfully to the coordinator!');
      setContent('');
      onSuggestionSent?.();
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#ffffff',
          borderRadius: 14,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '14px 18px',
            background: '#4f46e5',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}>
            <Lightbulb size={18} color="#fef08a" />
            <span>Drop Academic Suggestion</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEXT SUMMARY CARD */}
        <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Active Analytics Context
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
            {academicContext?.programmeName || 'Academic Programme'}{' '}
            {academicContext?.batchName ? `• ${academicContext.batchName}` : ''}
          </div>
          {academicContext?.courseName && (
            <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
              📖 Course: {academicContext.courseName}
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>Recipient:</span>
            <span
              style={{
                background: 'rgba(79, 70, 229, 0.1)',
                color: '#4f46e5',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {targetRoleTitle}
            </span>
          </div>
        </div>

        {/* COMPOSER FORM */}
        <form onSubmit={handleSend} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {errorMsg && (
            <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 12, display: 'flex', gap: 6 }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, color: '#15803d', fontSize: 12 }}>
              {successMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                color: '#1e293b',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="ATTAINMENT_GAP">Attainment Gap Observation</option>
              <option value="CURRICULUM_ACTION">Curriculum Action Recommendation</option>
              <option value="GENERAL">General Academic Suggestion</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 5 }}>
              Suggestion Details
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide constructive recommendations on improving attainment, closing course gaps, or curriculum actions..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                color: '#1e293b',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              style={{
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                background: content.trim() && !isSubmitting ? '#4f46e5' : '#a5b4fc',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{isSubmitting ? 'Submitting...' : 'Send Suggestion'}</span>
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
