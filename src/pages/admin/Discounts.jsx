import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, MapPin, Percent } from 'lucide-react';
import { adminAPI } from '../../services/api';

const PRESET_LOCATIONS = [
  'Sahel', 'North Coast', 'Gouna', 'El Gouna', 'Fouka', 'Almaza',
  'Ain Sokhna', 'Marassi', 'Ras El Hekma', 'Sidi Abd El Rahman',
  'Sharm El Sheikh', 'Hurghada', 'Red Sea', 'Cairo', 'Alexandria',
];

const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={onCancel}>
    <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
      <p style={{ fontSize: '1rem', color: '#112a3d', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} disabled={loading} style={{ padding: '10px 22px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#666' }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{loading ? 'Deleting…' : 'Delete'}</button>
      </div>
    </div>
  </div>
);

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // New discount form
  const [keyword, setKeyword] = useState('');
  const [customKeyword, setCustomKeyword] = useState('');
  const [percent, setPercent] = useState('');
  const [label, setLabel] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  const fetchDiscounts = () => {
    setLoading(true);
    adminAPI.getDiscounts()
      .then((res) => setDiscounts(res.data.discounts || []))
      .catch(() => setDiscounts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    const finalKeyword = keyword === '__custom__' ? customKeyword.trim() : keyword;
    if (!finalKeyword) { setFormError('Please select or enter a location.'); return; }
    const pct = parseFloat(percent);
    if (!percent || isNaN(pct) || pct <= 0 || pct >= 100) { setFormError('Enter a discount between 1 and 99%.'); return; }

    setSaving(true);
    try {
      await adminAPI.createDiscount({
        locationKeyword: finalKeyword,
        discountPercent: pct,
        label: label.trim() || null,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
      });
      setKeyword(''); setCustomKeyword(''); setPercent(''); setLabel(''); setStartsAt(''); setEndsAt('');
      flash('Discount created successfully.');
      fetchDiscounts();
    } catch (err) {
      setFormError(err.message || 'Failed to create discount.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (d) => {
    try {
      await adminAPI.updateDiscount(d.id, { isActive: !d.isActive });
      setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: !x.isActive } : x));
      flash(d.isActive ? 'Discount paused.' : 'Discount activated.');
    } catch (err) {
      alert(err.message || 'Failed to update.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await adminAPI.deleteDiscount(deleteConfirm.id);
      setDiscounts((prev) => prev.filter((x) => x.id !== deleteConfirm.id));
      flash('Discount deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete.');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm(null);
    }
  };

  const now = new Date();
  const isExpired = (d) => d.endsAt && new Date(d.endsAt) < now;
  const isScheduled = (d) => d.startsAt && new Date(d.startsAt) > now;

  const statusBadge = (d) => {
    if (!d.isActive) return { label: 'Paused', bg: '#f5f5f5', color: '#8b8b8b' };
    if (isExpired(d)) return { label: 'Expired', bg: '#fdeaea', color: '#c0392b' };
    if (isScheduled(d)) return { label: 'Scheduled', bg: '#fff8e1', color: '#f57f17' };
    return { label: 'Active', bg: '#e8f5e9', color: '#2e7d32' };
  };

  return (
    <div style={{ padding: '40px', maxWidth: 900, margin: '0 auto' }}>
      {deleteConfirm && (
        <ConfirmModal
          message={`Delete the "${deleteConfirm.locationKeyword}" discount? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
          loading={deleteLoading}
        />
      )}

      <h2 style={{ color: '#112a3d', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Location Discounts</h2>
      <p style={{ color: '#8b8b8b', fontSize: '0.9rem', marginBottom: 40 }}>
        Apply a percentage discount to all approved properties in a given location.
        The discounted price is shown automatically on listing cards and the property detail page.
      </p>

      {/* ── Create form ── */}
      <div style={{ background: '#f9f6f1', border: '1.5px solid #e8e0d4', borderRadius: 16, padding: '28px 32px', marginBottom: 40 }}>
        <h3 style={{ color: '#112a3d', fontWeight: 800, marginBottom: 24, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} /> Add New Discount
        </h3>

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Location *</label>
              <select value={keyword} onChange={(e) => setKeyword(e.target.value)} style={inputStyle}>
                <option value="">Select a location…</option>
                {PRESET_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                <option value="__custom__">Other (type below)</option>
              </select>
              {keyword === '__custom__' && (
                <input
                  type="text"
                  placeholder="Type location keyword…"
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  style={{ ...inputStyle, marginTop: 8 }}
                />
              )}
            </div>

            <div>
              <label style={labelStyle}>Discount % *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min="1" max="99" step="0.5"
                  placeholder="e.g. 20"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                <Percent size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. Summer Sahel Sale"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Starts (optional)</label>
                <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ends (optional)</label>
                <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {formError && <p style={{ color: '#c0392b', fontSize: '0.83rem', fontWeight: 700, marginBottom: 12 }}>{formError}</p>}
          {successMsg && <p style={{ color: '#2e7d32', fontSize: '0.83rem', fontWeight: 700, marginBottom: 12 }}>✓ {successMsg}</p>}

          <button type="submit" disabled={saving} style={{
            padding: '12px 28px', background: '#112a3d', color: '#f6f3eb',
            border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem',
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Creating…' : 'Create Discount'}
          </button>
        </form>
      </div>

      {/* ── Discounts list ── */}
      {loading ? (
        <p style={{ opacity: 0.5 }}>Loading discounts…</p>
      ) : discounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b8b8b' }}>
          <Tag size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p>No discounts yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {discounts.map((d) => {
            const badge = statusBadge(d);
            return (
              <div key={d.id} style={{
                background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 14,
                padding: '20px 24px', display: 'flex', alignItems: 'center',
                gap: 20, flexWrap: 'wrap',
                opacity: !d.isActive || isExpired(d) ? 0.65 : 1,
              }}>
                {/* Location + label */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPin size={15} color="#c4a369" />
                    <strong style={{ color: '#112a3d', fontSize: '0.95rem' }}>{d.locationKeyword}</strong>
                  </div>
                  {d.label && <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: 0 }}>{d.label}</p>}
                  {d.startsAt && <p style={{ fontSize: '0.72rem', color: '#8b8b8b', margin: '4px 0 0' }}>
                    {new Date(d.startsAt).toLocaleDateString()} → {d.endsAt ? new Date(d.endsAt).toLocaleDateString() : 'no end'}
                  </p>}
                </div>

                {/* Percent */}
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c4a369', lineHeight: 1 }}>
                    {parseFloat(d.discountPercent).toFixed(0)}%
                  </span>
                  <p style={{ fontSize: '0.7rem', color: '#8b8b8b', margin: 0 }}>off</p>
                </div>

                {/* Status badge */}
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggle(d)}
                    title={d.isActive ? 'Pause discount' : 'Activate discount'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.isActive ? '#4caf82' : '#8b8b8b', display: 'flex' }}
                  >
                    {d.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(d)}
                    title="Delete discount"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '1px',
  color: '#112a3d', marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e0d9ce', fontSize: '0.88rem',
  fontFamily: 'inherit', color: '#112a3d', background: '#fff',
  boxSizing: 'border-box', outline: 'none',
};

export default Discounts;
