import React, { useState } from 'react';
import { X, Building2, Save, Mail, User, Calendar, Tag } from 'lucide-react';
import { academicApi } from '../api';
import { useToast } from '../context/ToastContext';

export const SchoolModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    dean: '',
    deanEmail: '',
    estYear: new Date().getFullYear().toString(),
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('School Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setErrorMsg('School Code is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const cleanCode = formData.code.trim().toUpperCase();
    const payload = {
      id: `sch-${cleanCode.toLowerCase()}-${Date.now()}`,
      name: formData.name.trim(),
      code: cleanCode,
      directorName: formData.dean.trim() || null,
      directorEmail: formData.deanEmail.trim() || null,
      dean: formData.dean.trim() || null,
      deanEmail: formData.deanEmail.trim() || null,
      estYear: formData.estYear.trim() || null,
    };

    try {
      await academicApi.createSchool(payload);
      showToast({ message: `School "${formData.name}" added successfully!`, type: 'success' });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create School.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Add New School
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Register a new academic school / faculty in the OBE system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
                fontSize: '12.5px',
                fontWeight: '500',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* School Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              School Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="e.g. School of Engineering & Technology"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: '13.5px',
                }}
              />
            </div>
          </div>

          {/* School Code & Established Year */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                School Code <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Tag size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="e.g. SOE or SET"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Established Year
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="e.g. 2019"
                  value={formData.estYear}
                  onChange={(e) => handleChange('estYear', e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dean / Director Details */}
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              Dean / Director Leadership (Optional)
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Dean / Director Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="e.g. Dr. R. K. Deshmukh"
                  value={formData.dean}
                  onChange={(e) => handleChange('dean', e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '6px 10px 6px 32px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '12.5px',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Dean / Director Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="email"
                  placeholder="e.g. director.soe@dypiu.ac.in"
                  value={formData.deanEmail}
                  onChange={(e) => handleChange('deanEmail', e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '6px 10px 6px 32px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    fontSize: '12.5px',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Save size={15} />
              <span>{submitting ? 'Saving School...' : 'Save School'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolModal;
