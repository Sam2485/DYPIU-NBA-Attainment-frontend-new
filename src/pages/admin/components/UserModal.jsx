import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react';
import { usersApi, academicApi } from '../api';
import { useToast } from '../context/ToastContext';

export const UserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const isEdit = Boolean(user);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FACULTY',
    schoolId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load schools from backend
  useEffect(() => {
    if (!isOpen) return;
    setLoadingSchools(true);
    academicApi
      .getSchools()
      .then((sRes) => {
        const sList = sRes?.data || sRes || [];
        setSchools(Array.isArray(sList) ? sList : []);
      })
      .catch(() => {
        setSchools([]);
      })
      .finally(() => {
        setLoadingSchools(false);
      });
  }, [isOpen]);

  // Set form data when modal opens or user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'FACULTY',
        schoolId: user.schoolId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'FACULTY',
        schoolId: '',
      });
    }
    setErrorMsg('');
    setShowPassword(false);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Email is required.');
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      setErrorMsg('Password is required for creating a new user.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const emailTrimmed = formData.email.trim();
    const derivedUsername = emailTrimmed.includes('@') ? emailTrimmed.split('@')[0] : emailTrimmed;

    const targetId = user?.id ?? user?.userId ?? user?._id;

    const payload = {
      name: formData.name.trim(),
      email: emailTrimmed,
      username: (user?.username || derivedUsername).toLowerCase().replace(/[^a-z0-9._-]/g, ''),
      role: formData.role,
      schoolId: formData.schoolId && formData.schoolId.trim() !== '' ? formData.schoolId.trim() : null,
      departmentId: isEdit ? (user?.departmentId || null) : null,
      programmeId: isEdit ? (user?.programmeId || null) : null,
    };

    if (formData.password && formData.password.trim() !== '') {
      payload.password = formData.password.trim();
    }

    try {
      if (isEdit) {
        if (!targetId) {
          throw new Error('Cannot update user: Missing user ID.');
        }
        await usersApi.updateUser(targetId, payload);
        showToast({ message: `${formData.name} updated successfully`, type: 'success' });
      } else {
        await usersApi.createUser(payload);
        showToast({ message: `${formData.name} registered successfully`, type: 'success' });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save academic member.');
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
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
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
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {isEdit ? 'Edit Academic Member' : 'Register Academic Member'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {isEdit ? 'Update credentials and assigned school' : 'Register a new member with name, email, password, role & school'}
            </p>
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

        {/* Modal Body / Registration Form */}
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

          {/* 1. Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="e.g. Dr. Jane Doe"
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

          {/* 2. Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Email <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="email"
                placeholder="jane.doe@dypiu.ac.in"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
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

          {/* 3. Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Password {!isEdit && <span style={{ color: 'var(--danger)' }}>*</span>}
              {isEdit && <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '6px' }}>(Leave empty to keep current password)</span>}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? '••••••••' : 'Enter login password (e.g. Dypiu#2026)'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required={!isEdit}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '8px 40px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: '13px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* 4. Role Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Role <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { role: 'DIRECTOR', label: 'Director', desc: 'School Leadership' },
                { role: 'HOD', label: 'Head of Department', desc: 'Department Leadership' },
                { role: 'PROGRAMME_COORDINATOR', label: 'Programme Coord.', desc: 'Curriculum & POs' },
                { role: 'FACULTY', label: 'Faculty / Course Coord.', desc: 'Teaching & COs' },
              ].map((r) => {
                const isSelected = formData.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => handleChange('role', r.role)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. School Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              School Selector <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Building2 size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px' }} />
              <select
                value={formData.schoolId}
                onChange={(e) => handleChange('schoolId', e.target.value)}
                disabled={loadingSchools}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">{loadingSchools ? 'Loading schools...' : 'Select School'}</option>
                {schools.map((school, index) => {
                  // The schools endpoint may expose its identifier as `schoolId`
                  // instead of `id`. Resolve both so each option has a usable value
                  // and a unique React key.
                  const schoolId = school.id ?? school.schoolId ?? school._id;

                  return (
                    <option key={`${schoolId ?? 'school'}-${index}`} value={schoolId ?? ''}>
                      {school.name} ({school.code})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
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
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Save size={15} />
              <span>{submitting ? 'Saving...' : isEdit ? 'Update Member' : 'Register Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
