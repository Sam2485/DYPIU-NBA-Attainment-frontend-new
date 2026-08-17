import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Clock, XCircle, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPendingApprovals, approveItem, requestRevision } from '../../api/approvalApi';

export default function DirectorApprovals() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await getPendingApprovals({ role: 'DIRECTOR' });
      const list = res?.data?.approvals || res?.approvals || res?.data || (Array.isArray(res) ? res : []);
      setApprovals(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to fetch director approvals:', err);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (appId) => {
    try {
      setActionLoading(appId);
      const remarks = remarksMap[appId] || '';
      await approveItem(appId, remarks);
      alert('✓ Submission approved by Director!');
      await fetchApprovals();
    } catch (err) {
      alert('Approval failed: ' + (err.message || 'Error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendBack = async (appId) => {
    try {
      setActionLoading(appId);
      const remarks = remarksMap[appId] || 'Please review and resubmit.';
      await requestRevision(appId, remarks);
      alert(`Submission sent back to HOD with remarks: "${remarks}"`);
      await fetchApprovals();
    } catch (err) {
      alert('Revision request failed: ' + (err.message || 'Error'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animated-page" style={{ paddingBottom: '40px' }}>
      {/* Banner */}
      <div className="banner-dark-gradient" style={{ marginBottom: '24px' }}>
        <div className="banner-content-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fef08a', fontWeight: '800', fontSize: '11px' }}>
                DIRECTOR PORTAL • APPROVALS & VISIBILITY
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontWeight: '800' }}>
              Director Level Approvals & Submission Visibility
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
              Review HOD submissions for PO/PSO outcome frameworks and annual Programme Action Taken Reports (ATR).
            </p>
          </div>

          <button
            onClick={fetchApprovals}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <RefreshCw size={24} className="spin" style={{ color: '#4f46e5', marginBottom: '8px' }} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Loading director approvals from database...</div>
        </div>
      ) : approvals.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
          <CheckCircle2 size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
          <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>No Pending Approvals</h3>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
            All HOD submissions and Programme outcome frameworks are up to date in the database.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {approvals.map((item) => {
            const isPending = item.status === 'PENDING' || item.status === 'SUBMITTED';
            const isApproved = item.status === 'APPROVED' || item.status === 'VERIFIED';
            const isNeedsRevision = item.status === 'NEEDS_REVISION' || item.status === 'REVISION_REQUESTED';

            return (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: isPending ? '1.5px solid #6366f1' : isApproved ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-active" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px' }}>
                      {item.programmeCode || item.programme || 'OBE'}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                      {item.title || item.itemName || 'Submission for Verification'}
                    </h4>
                  </div>

                  {isApproved ? (
                    <span className="badge badge-active" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '11.5px' }}>
                      ✓ Approved by Director
                    </span>
                  ) : isNeedsRevision ? (
                    <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontWeight: '800', fontSize: '11.5px' }}>
                      ✗ Sent Back for Revision
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309', fontWeight: '800', fontSize: '11.5px' }}>
                      ⏳ Pending Director Approval
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: '#334155', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  {item.details || item.description || 'Outcome framework / Programme ATR awaiting review.'}
                </p>

                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Submitted by: <strong style={{ color: '#0f172a' }}>{item.submittedBy || 'HOD'}</strong></span>
                  <span>Date: <strong>{item.submittedAt || item.createdAt || 'Recent'}</strong></span>
                  {isApproved && <span>Approved by: <strong style={{ color: '#15803d' }}>{item.approvedBy || user?.name}</strong></span>}
                </div>

                {/* Actions Footer */}
                {isPending && (
                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Optional remarks or notes for HOD..."
                        value={remarksMap[item.id] || ''}
                        onChange={(e) => setRemarksMap({ ...remarksMap, [item.id]: e.target.value })}
                        className="form-input"
                        style={{ height: '38px', fontSize: '12.5px', flex: 1 }}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleApprove(item.id)}
                        disabled={actionLoading === item.id}
                        style={{ height: '38px', padding: '0 18px', fontSize: '12.5px', fontWeight: '800', gap: '6px', background: '#059669' }}
                      >
                        <Check size={15} /> Approve Framework
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleSendBack(item.id)}
                        disabled={actionLoading === item.id}
                        style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: '800', gap: '6px' }}
                      >
                        <XCircle size={15} /> Send Back
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
