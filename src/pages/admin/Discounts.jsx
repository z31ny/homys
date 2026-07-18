import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, MapPin, Percent, Home, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';

const PRESET_LOCATIONS = [
  'Sahel','North Coast','Gouna','El Gouna','Fouka','Almaza',
  'Ain Sokhna','Marassi','Ras El Hekma','Sidi Abd El Rahman',
  'Sharm El Sheikh','Hurghada','Red Sea','Cairo','Alexandria',
];

const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#112a3d', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0d9ce', fontSize: '0.88rem', fontFamily: 'inherit', color: '#112a3d', background: '#fff', boxSizing: 'border-box', outline: 'none' };

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

// ─── Tab: Location Discounts ────────────────────────────────────────────────
const LocationDiscountsTab = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
      await adminAPI.createDiscount({ locationKeyword: finalKeyword, discountPercent: pct, label: label.trim() || null, startsAt: startsAt || null, endsAt: endsAt || null });
      setKeyword(''); setCustomKeyword(''); setPercent(''); setLabel(''); setStartsAt(''); setEndsAt('');
      flash('Discount created.'); fetchDiscounts();
    } catch (err) { setFormError(err.message || 'Failed to create discount.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (d) => {
    try {
      await adminAPI.updateDiscount(d.id, { isActive: !d.isActive });
      setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, isActive: !x.isActive } : x));
      flash(d.isActive ? 'Paused.' : 'Activated.');
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await adminAPI.deleteDiscount(deleteConfirm.id);
      setDiscounts((prev) => prev.filter((x) => x.id !== deleteConfirm.id));
      flash('Deleted.');
    } catch (err) { alert(err.message); }
    finally { setDeleteLoading(false); setDeleteConfirm(null); }
  };

  const now = new Date();
  const statusBadge = (d) => {
    if (!d.isActive) return { label: 'Paused', bg: '#f5f5f5', color: '#8b8b8b' };
    if (d.endsAt && new Date(d.endsAt) < now) return { label: 'Expired', bg: '#fdeaea', color: '#c0392b' };
    if (d.startsAt && new Date(d.startsAt) > now) return { label: 'Scheduled', bg: '#fff8e1', color: '#f57f17' };
    return { label: 'Active', bg: '#e8f5e9', color: '#2e7d32' };
  };

  return (
    <>
      {deleteConfirm && <ConfirmModal message={`Delete the "${deleteConfirm.locationKeyword}" discount?`} onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} loading={deleteLoading} />}

      <div style={{ background: '#f9f6f1', border: '1.5px solid #e8e0d4', borderRadius: 16, padding: '28px 32px', marginBottom: 32 }}>
        <h3 style={{ color: '#112a3d', fontWeight: 800, marginBottom: 20, fontSize: '1rem' }}>Add Location Discount</h3>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Location *</label>
              <select value={keyword} onChange={(e) => setKeyword(e.target.value)} style={inputStyle}>
                <option value="">Select location…</option>
                {PRESET_LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                <option value="__custom__">Other (type below)</option>
              </select>
              {keyword === '__custom__' && <input type="text" placeholder="Type location keyword…" value={customKeyword} onChange={(e) => setCustomKeyword(e.target.value)} style={{ ...inputStyle, marginTop: 8 }} />}
            </div>
            <div>
              <label style={labelStyle}>Discount % *</label>
              <div style={{ position: 'relative' }}>
                <input type="number" min="1" max="99" step="0.5" placeholder="e.g. 20" value={percent} onChange={(e) => setPercent(e.target.value)} style={{ ...inputStyle, paddingRight: 36 }} />
                <Percent size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Label (optional)</label>
              <input type="text" placeholder="e.g. Summer Sahel Sale" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Starts</label>
                <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ends</label>
                <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>
          {formError && <p style={{ color: '#c0392b', fontSize: '0.83rem', fontWeight: 700, marginBottom: 12 }}>{formError}</p>}
          {successMsg && <p style={{ color: '#2e7d32', fontSize: '0.83rem', fontWeight: 700, marginBottom: 12 }}>✓ {successMsg}</p>}
          <button type="submit" disabled={saving} style={{ padding: '12px 28px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Creating…' : 'Create Discount'}
          </button>
        </form>
      </div>

      {loading ? <p style={{ opacity: 0.5 }}>Loading…</p> : discounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b8b8b' }}>
          <Tag size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p>No location discounts yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {discounts.map((d) => {
            const badge = statusBadge(d);
            return (
              <div key={d.id} style={{ background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', opacity: !d.isActive ? 0.65 : 1 }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <MapPin size={15} color="#c4a369" />
                    <strong style={{ color: '#112a3d' }}>{d.locationKeyword}</strong>
                  </div>
                  {d.label && <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: 0 }}>{d.label}</p>}
                  {d.startsAt && <p style={{ fontSize: '0.72rem', color: '#8b8b8b', margin: '4px 0 0' }}>{new Date(d.startsAt).toLocaleDateString()} → {d.endsAt ? new Date(d.endsAt).toLocaleDateString() : 'no end'}</p>}
                </div>
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c4a369', lineHeight: 1 }}>{parseFloat(d.discountPercent).toFixed(0)}%</span>
                  <p style={{ fontSize: '0.7rem', color: '#8b8b8b', margin: 0 }}>off</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 800, background: badge.bg, color: badge.color }}>{badge.label}</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={() => handleToggle(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.isActive ? '#4caf82' : '#8b8b8b', display: 'flex' }}>
                    {d.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                  <button onClick={() => setDeleteConfirm(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ─── Tab: Unit Discounts ────────────────────────────────────────────────────
const UnitDiscountsTab = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [edits, setEdits] = useState({}); // { [propId]: { discountPercent, discountLabel } }
  const [successMsg, setSuccessMsg] = useState('');

  const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

  useEffect(() => {
    adminAPI.getProperties({ limit: 200 })
      .then((res) => {
        const props = res.data.properties || [];
        setProperties(props);
        const initEdits = {};
        props.forEach((p) => {
          initEdits[p.id] = {
            discountPercent: p.discountPercent ? String(parseFloat(p.discountPercent)) : '',
            discountLabel: p.discountLabel || '',
          };
        });
        setEdits(initEdits);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const setEdit = (id, key, value) => setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const handleSave = async (prop) => {
    const edit = edits[prop.id] || {};
    const pct = edit.discountPercent ? parseFloat(edit.discountPercent) : null;
    if (pct !== null && (isNaN(pct) || pct < 0 || pct >= 100)) { alert('Enter a valid discount between 0 and 99%.'); return; }
    setSaving(prop.id);
    try {
      await adminAPI.updateProperty(prop.id, {
        discountPercent: pct,
        discountLabel: edit.discountLabel || null,
      });
      setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, discountPercent: pct ? String(pct) : null, discountLabel: edit.discountLabel || null } : p));
      flash(`Saved discount for "${prop.title}".`);
    } catch (err) { alert(err.message || 'Failed to save.'); }
    finally { setSaving(null); }
  };

  const handleClear = async (prop) => {
    setSaving(prop.id);
    try {
      await adminAPI.updateProperty(prop.id, { discountPercent: null, discountLabel: null });
      setProperties((prev) => prev.map((p) => p.id === prop.id ? { ...p, discountPercent: null, discountLabel: null } : p));
      setEdit(prop.id, 'discountPercent', '');
      setEdit(prop.id, 'discountLabel', '');
      flash('Discount removed.');
    } catch (err) { alert(err.message || 'Failed to clear.'); }
    finally { setSaving(null); }
  };

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.title?.toLowerCase().includes(q) || p.locationName?.toLowerCase().includes(q);
  });

  return (
    <>
      {successMsg && <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 10, padding: '10px 16px', color: '#2e7d32', fontWeight: 700, marginBottom: 20 }}>✓ {successMsg}</div>}

      <div style={{ marginBottom: 20, position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
        <input type="text" placeholder="Search properties…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 40 }} />
      </div>

      {loading ? <p style={{ opacity: 0.5 }}>Loading properties…</p> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}><p>No properties found.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((prop) => {
            const edit = edits[prop.id] || { discountPercent: '', discountLabel: '' };
            const price = parseFloat(prop.pricePerNight || 0);
            const discounted = edit.discountPercent ? price * (1 - parseFloat(edit.discountPercent) / 100) : null;
            const isSaving = saving === prop.id;

            return (
              <div key={prop.id} style={{ background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Info */}
                  <div style={{ flex: '1 1 180px' }}>
                    <p style={{ fontWeight: 800, color: '#112a3d', margin: '0 0 4px', fontSize: '0.95rem' }}>{prop.title}</p>
                    <p style={{ fontSize: '0.78rem', color: '#8b8b8b', margin: 0 }}>{prop.locationName} · {prop.propertyType}</p>
                    <p style={{ fontSize: '0.82rem', color: '#112a3d', margin: '6px 0 0', fontWeight: 700 }}>
                      EGP {price.toLocaleString()} / night
                    </p>
                    {prop.discountPercent && (
                      <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, background: '#fff8e1', color: '#e65100', fontSize: '0.72rem', fontWeight: 800 }}>
                        Current: {parseFloat(prop.discountPercent).toFixed(0)}% off
                        {prop.discountLabel ? ` — ${prop.discountLabel}` : ''}
                      </span>
                    )}
                  </div>

                  {/* Inputs */}
                  <div style={{ flex: '2 1 320px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '0 0 110px' }}>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>Discount %</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" min="0" max="99" step="0.5" placeholder="e.g. 10" value={edit.discountPercent}
                          onChange={(e) => setEdit(prop.id, 'discountPercent', e.target.value)}
                          style={{ ...inputStyle, paddingRight: 30, width: '100%' }} />
                        <Percent size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      </div>
                    </div>
                    <div style={{ flex: '1 1 160px' }}>
                      <label style={{ ...labelStyle, marginBottom: 4 }}>Label</label>
                      <input type="text" placeholder="e.g. Limited Offer" value={edit.discountLabel}
                        onChange={(e) => setEdit(prop.id, 'discountLabel', e.target.value)}
                        style={inputStyle} />
                    </div>

                    {/* Preview */}
                    {discounted !== null && edit.discountPercent > 0 && (
                      <div style={{ flex: '0 0 auto', padding: '8px 14px', background: '#f9f6f1', borderRadius: 10, fontSize: '0.82rem', color: '#112a3d', alignSelf: 'flex-end' }}>
                        <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>EGP {price.toLocaleString()}</span>
                        {' → '}
                        <strong style={{ color: '#c4a369' }}>EGP {discounted.toLocaleString('en', { maximumFractionDigits: 0 })}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end' }}>
                      <button onClick={() => handleSave(prop)} disabled={isSaving}
                        style={{ padding: '9px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>
                        {isSaving ? 'Saving…' : 'Save'}
                      </button>
                      {prop.discountPercent && (
                        <button onClick={() => handleClear(prop)} disabled={isSaving}
                          style={{ padding: '9px 16px', background: '#fde8e8', color: '#c62828', border: 'none', borderRadius: 50, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

// ─── Main Discounts page ────────────────────────────────────────────────────
const Discounts = () => {
  const [tab, setTab] = useState('location');

  return (
    <div style={{ padding: '40px', maxWidth: 960, margin: '0 auto' }}>
      <h2 style={{ color: '#112a3d', fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Discounts</h2>
      <p style={{ color: '#8b8b8b', fontSize: '0.88rem', marginBottom: 28 }}>
        Apply discounts by location (affects all properties in that area) or per individual unit.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {[
          { key: 'location', label: 'Location Discounts', icon: <MapPin size={15} /> },
          { key: 'unit',     label: 'Unit Discounts',     icon: <Home    size={15} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', border: '2px solid', fontFamily: 'inherit',
              background: tab === t.key ? '#112a3d' : '#fff',
              color: tab === t.key ? '#f6f3eb' : '#112a3d',
              borderColor: tab === t.key ? '#112a3d' : '#e0d9ce',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'location' ? <LocationDiscountsTab /> : <UnitDiscountsTab />}
    </div>
  );
};

export default Discounts;
