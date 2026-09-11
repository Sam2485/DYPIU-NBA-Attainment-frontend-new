import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Edit3, Award, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';

const ink = '#0f172a';
const muted = '#64748b';
const accent = '#4f46e5';

const DEFAULT_POS = [
  { code: 'PO1', statement: 'Engineering knowledge' },
  { code: 'PO2', statement: 'Problem analysis' },
  { code: 'PO3', statement: 'Design/development of solutions' },
  { code: 'PO4', statement: 'Conduct investigations of complex problems' },
  { code: 'PO5', statement: 'Modern tool usage' },
  { code: 'PO6', statement: 'The engineer and society' },
  { code: 'PO7', statement: 'Environment and sustainability' },
  { code: 'PO8', statement: 'Ethics' },
  { code: 'PO9', statement: 'Individual and team work' },
  { code: 'PO10', statement: 'Communication' },
  { code: 'PO11', statement: 'Project management and finance' },
  { code: 'PO12', statement: 'Life-long learning' },
];

export default function IndirectAssessmentModal({
  isOpen,
  onClose,
  onSave,
  assessment = null,
  activePOs = [],
  activePSOs = [],
  saving = false,
}) {
  const effectivePOs = (activePOs && activePOs.length > 0) ? activePOs : DEFAULT_POS;
  const effectivePSOs = activePSOs || [];
  const [name, setName] = useState('');
  const [type, setType] = useState('EVENT');
  const [description, setDescription] = useState('');
  const [scores, setScores] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (assessment) {
        setName(assessment.name || '');
        setType(assessment.type || 'EVENT');
        setDescription(assessment.description || '');
        setScores(assessment.scores ? { ...assessment.scores } : {});
      } else {
        setName('');
        setType('EVENT');
        setDescription('');
        setScores({});
      }
    }
  }, [isOpen, assessment]);

  if (!isOpen) return null;

  const handleScoreChange = (code, valStr) => {
    if (valStr === '' || valStr === null || valStr === undefined) {
      setScores((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
      return;
    }
    const num = parseFloat(valStr);
    setScores((prev) => ({
      ...prev,
      [code]: isNaN(num) ? '' : num,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      setError('Please enter a title or event name.');
      return;
    }

    // Validate scores are within 1.00 to 3.00 if provided
    const sanitizedScores = {};
    for (const [code, val] of Object.entries(scores)) {
      if (val !== '' && val !== null && val !== undefined) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 3.0) {
          setError(`Attainment score for ${code} must be between 1.00 and 3.00 (or leave blank).`);
          return;
        }
        if (num > 0) {
          sanitizedScores[code.toUpperCase()] = Number(num.toFixed(2));
        }
      }
    }

    onSave({
      name: name.trim(),
      type: type || 'EVENT',
      description: description.trim(),
      scores: sanitizedScores,
    });
  };

  const isEdit = Boolean(assessment && assessment.id);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15,23,42,0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '90vh',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: type === 'EVENT' ? '#eef2ff' : '#f5f3ff',
                display: 'grid',
                placeItems: 'center',
                color: type === 'EVENT' ? accent : '#7c3aed',
              }}
            >
              {type === 'EVENT' ? <Award size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: ink }}>
                {isEdit ? 'Edit Assessment' : 'Add Survey or Co-Curricular Event'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: muted }}>
                Directly enter indirect attainment scores (1.00 – 3.00) for evaluated POs &amp; PSOs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              color: muted,
              padding: '6px',
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '12.5px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Title & Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: ink,
                    marginBottom: '5px',
                  }}
                >
                  Event / Survey Title <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Smart India Hackathon 2025, Alumni Exit Survey"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  style={{
                    height: '38px',
                    fontSize: '13px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 12px',
                    background: '#ffffff',
                    color: ink,
                    width: '100%',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: ink,
                    marginBottom: '5px',
                  }}
                >
                  Assessment Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={saving}
                  style={{
                    height: '38px',
                    fontSize: '13px',
                    fontWeight: '600',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 10px',
                    background: '#ffffff',
                    color: ink,
                    width: '100%',
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  <option value="EVENT">Co-Curricular Event</option>
                  <option value="SURVEY">Survey</option>
                </select>
              </div>
            </div>

            {/* Row 2: Description */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: ink,
                  marginBottom: '5px',
                }}
              >
                Description / Remarks <span style={{ color: muted, fontWeight: 'normal' }}>(Optional)</span>
              </label>
              <textarea
                placeholder="Brief description about the event or survey stakeholder group..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                rows={2}
                style={{
                  fontSize: '12.5px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  background: '#ffffff',
                  color: ink,
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Row 3: PO & PSO Direct Attainment Matrix */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label
                  style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: ink,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Outcome Indirect Attainment (1.00 – 3.00)
                </label>
                <span style={{ fontSize: '11px', color: muted }}>
                  Leave blank for outcomes not assessed in this event/survey.
                </span>
              </div>

              {/* POs Section */}
              {effectivePOs.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: accent, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Programme Outcomes (POs)
                  </div>
                  <div
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    <table className="audit-data-table" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '70px', textAlign: 'center' }}>PO</th>
                          <th>Statement</th>
                          <th style={{ width: '140px', textAlign: 'center' }}>Attainment (1.00 – 3.00)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectivePOs.map((po) => {
                          const currentVal = scores[po.code] !== undefined ? scores[po.code] : '';
                          return (
                            <tr key={po.code}>
                              <td style={{ textAlign: 'center', fontWeight: '800', color: accent }}>{po.code}</td>
                              <td style={{ fontSize: '12px', color: ink }}>{po.statement}</td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min={1.0}
                                  max={3.0}
                                  step={0.01}
                                  placeholder=""
                                  value={currentVal}
                                  onChange={(e) => handleScoreChange(po.code, e.target.value)}
                                  disabled={saving}
                                  style={{
                                    height: '32px',
                                    width: '90px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    border: currentVal !== '' ? `1.5px solid ${accent}` : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '0 8px',
                                    textAlign: 'center',
                                    color: accent,
                                    background: currentVal !== '' ? '#f5f3ff' : '#ffffff',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PSOs Section */}
              {effectivePSOs.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Programme Specific Outcomes (PSOs)
                  </div>
                  <div
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      maxHeight: '180px',
                      overflowY: 'auto',
                    }}
                  >
                    <table className="audit-data-table" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '70px', textAlign: 'center' }}>PSO</th>
                          <th>Statement</th>
                          <th style={{ width: '140px', textAlign: 'center' }}>Attainment (1.00 – 3.00)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectivePSOs.map((pso) => {
                          const currentVal = scores[pso.code] !== undefined ? scores[pso.code] : '';
                          return (
                            <tr key={pso.code}>
                              <td style={{ textAlign: 'center', fontWeight: '800', color: '#059669' }}>{pso.code}</td>
                              <td style={{ fontSize: '12px', color: ink }}>{pso.statement}</td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min={1.0}
                                  max={3.0}
                                  step={0.01}
                                  placeholder=""
                                  value={currentVal}
                                  onChange={(e) => handleScoreChange(pso.code, e.target.value)}
                                  disabled={saving}
                                  style={{
                                    height: '32px',
                                    width: '90px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    border: currentVal !== '' ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '0 8px',
                                    textAlign: 'center',
                                    color: '#059669',
                                    background: currentVal !== '' ? '#ecfdf5' : '#ffffff',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fafafa',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                height: '36px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: '600',
                background: '#ffffff',
                color: muted,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                height: '36px',
                padding: '0 20px',
                fontSize: '13px',
                fontWeight: '700',
                background: accent,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check size={14} /> {isEdit ? 'Update Assessment' : 'Save Assessment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
