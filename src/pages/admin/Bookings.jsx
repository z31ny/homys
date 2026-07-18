import React, { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, Eye, CalendarPlus } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './Bookings.css';

const STATUSES = ['pending', 'confirmed', 'upcoming', 'completed', 'cancelled'];

const STATUS_COLOR = {
  pending:   '#f9a825',
  confirmed: '#3b82f6',
  upcoming:  '#f97316',
  completed: '#4caf82',
  cancelled: '#ef4444',
};

const DOCS_COLOR = {
  pending:   { bg: '#fff8e1', text: '#f57f17' },
  submitted: { bg: '#e8f4fd', text: '#1565c0' },
  approved:  { bg: '#e8f5e9', text: '#2e7d32' },
  rejected:  { bg: '#fce8e8', text: '#c62828' },
};

const DocModal = ({ booking, onClose, onAction }) => {
  const [actioning, setActioning] = useState(false);
  const docs = booking.bookingDocs || [];

  const handle = async (action) => {
    setActioning(true);
    try {
      await adminAPI.approveBookingDocs(booking.id, action);
      onAction(booking.id, action);
      onClose();
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setActioning(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, color: '#112a3d', fontWeight: 800 }}>Booking Documents</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#8b8b8b' }}>✕</button>
        </div>

        <div style={{ marginBottom: 20, padding: '14px 18px', background: '#f9f6f1', borderRadius: 12, fontSize: '0.85rem' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#112a3d' }}>{booking.guestFirstName} {booking.guestLastName}</p>
          <p style={{ margin: 0, color: '#8b8b8b' }}>{booking.propertyTitle} · {booking.checkIn} — {booking.checkOut}</p>
          {booking.hasFemaleGuest && (
            <p style={{ margin: '6px 0 0', color: '#880e4f', fontWeight: 700, fontSize: '0.8rem' }}>Female guest present</p>
          )}
        </div>

        {docs.length === 0 ? (
          <p style={{ color: '#8b8b8b', textAlign: 'center', padding: '30px' }}>No documents uploaded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {docs.map((doc, i) => (
              <div key={i} style={{ border: '1px solid #e8e0d4', borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={doc.url}
                  alt={doc.label}
                  style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e0d9ce' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: '0.88rem', color: '#112a3d' }}>{doc.label}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8b8b8b', textTransform: 'capitalize' }}>{doc.type.replace('_', ' ')} · {doc.owner}</p>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: '#1565c0', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={14} /> View
                </a>
              </div>
            ))}
          </div>
        )}

        {booking.docsStatus === 'submitted' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handle('reject')}
              disabled={actioning}
              style={{ flex: 1, padding: '12px', background: '#fde8e8', color: '#c62828', border: '1.5px solid #f5c6c6', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <XCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Reject & Request Resubmission
            </button>
            <button
              onClick={() => handle('approve')}
              disabled={actioning}
              style={{ flex: 1, padding: '12px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <CheckCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Approve & Confirm Booking
            </button>
          </div>
        )}

        {booking.docsStatus === 'approved' && (
          <div style={{ textAlign: 'center', color: '#2e7d32', fontWeight: 700, padding: '10px', background: '#e8f5e9', borderRadius: 12 }}>Booking confirmed. Documents approved.</div>
        )}
        {booking.docsStatus === 'rejected' && (
          <div style={{ textAlign: 'center', color: '#c62828', fontWeight: 700, padding: '10px', background: '#fce8e8', borderRadius: 12 }}>Documents rejected. Guest notified to resubmit.</div>
        )}
      </div>
    </div>
  );
};

const today = () => new Date().toISOString().split('T')[0];

const BlockModal = ({ onClose, onCreated }) => {
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getProperties({ limit: 200 })
      .then((res) => setProperties(res.data.properties || []))
      .catch(() => setProperties([]));
  }, []);

  const submit = async () => {
    if (!propertyId) { setError('Please choose a property.'); return; }
    if (!checkIn || !checkOut) { setError('Please choose both dates.'); return; }
    if (checkOut <= checkIn) { setError('Check-out must be after check-in.'); return; }
    setSaving(true); setError('');
    try {
      await adminAPI.createBooking({ propertyId, checkIn, checkOut, note: note || undefined });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to block these dates.');
    } finally {
      setSaving(false);
    }
  };

  const field = { width: '100%', padding: '11px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', color: '#112a3d', boxSizing: 'border-box', marginTop: 6 };
  const lbl = { display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#112a3d' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, color: '#112a3d', fontWeight: 800 }}>Block / Book Dates</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#8b8b8b' }}>✕</button>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#8b8b8b' }}>Reserves the dates with no payment. Guests can't book this property on these days.</p>

        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>Property</label>
          <select style={field} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">Select a property…</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.title}{p.locationName ? ` — ${p.locationName}` : ''}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Check-in</label>
            <input type="date" style={field} min={today()} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut && checkOut <= e.target.value) setCheckOut(''); }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Check-out</label>
            <input type="date" style={field} min={checkIn || today()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Note (optional)</label>
          <input type="text" style={field} placeholder="e.g. Maintenance, Owner stay" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {error && <p style={{ color: '#c0392b', fontWeight: 700, fontSize: '0.85rem', margin: '0 0 14px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#fff', color: '#112a3d', border: '1.5px solid #e0d9ce', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={submit} disabled={saving} style={{ flex: 1, padding: '12px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Blocking…' : 'Block Dates'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusDropdown = ({ bookingId, currentStatus, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handle = async (newStatus) => {
    if (newStatus === localStatus) { setOpen(false); return; }
    setLoading(true); setOpen(false);
    try {
      await adminAPI.updateBookingStatus(bookingId, newStatus);
      setLocalStatus(newStatus);
      onUpdated(bookingId, newStatus);
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1.5px solid ${STATUS_COLOR[localStatus] || '#ccc'}`, borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', color: STATUS_COLOR[localStatus] || '#666', whiteSpace: 'nowrap' }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_COLOR[localStatus] || '#ccc', display: 'inline-block' }} />
        {loading ? 'Saving…' : localStatus}
        {!loading && <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▾</span>}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 101, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 150, overflow: 'hidden', border: '1px solid #eee' }}>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => handle(s)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', border: 'none', background: s === localStatus ? '#f5f2ec' : '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: s === localStatus ? 700 : 500, fontSize: '0.82rem', color: STATUS_COLOR[s] || '#333' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[s] || '#ccc', flexShrink: 0 }} />
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [docsFilter, setDocsFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBlock, setShowBlock] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    adminAPI.getBookings({ page, limit: 20 })
      .then((res) => { setBookings(res.data.bookings || []); setPagination(res.data.pagination || {}); })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [page]);

  const handleStatusUpdated = (id, newStatus) => setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));

  const handleDocsAction = (id, action) => {
    const newDocsStatus = action === 'approve' ? 'approved' : 'rejected';
    const newStatus = action === 'approve' ? 'confirmed' : undefined;
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, docsStatus: newDocsStatus, ...(newStatus ? { status: newStatus } : {}) } : b));
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (b.guestFirstName || '').toLowerCase().includes(q) || (b.guestLastName || '').toLowerCase().includes(q) || (b.propertyTitle || '').toLowerCase().includes(q) || (b.guestEmail || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchDocs = !docsFilter || b.docsStatus === docsFilter;
    return matchSearch && matchStatus && matchDocs;
  });

  const pendingDocsCount = bookings.filter((b) => b.docsStatus === 'submitted').length;

  return (
    <div className="bookings-page">
      {selectedBooking && (
        <DocModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={(id, action) => { handleDocsAction(id, action); setSelectedBooking(null); }}
        />
      )}

      {showBlock && (
        <BlockModal
          onClose={() => setShowBlock(false)}
          onCreated={() => { setPage(1); fetchBookings(); }}
        />
      )}

      <div className="bookings-card">
        {pendingDocsCount > 0 && (
          <div style={{ margin: '20px 24px 0', padding: '12px 18px', background: '#e8f4fd', border: '1px solid #b3d7f2', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: '#1565c0', fontWeight: 700 }}>
            <FileText size={16} />
            {pendingDocsCount} booking{pendingDocsCount > 1 ? 's' : ''} with documents awaiting your review.
            <button onClick={() => setDocsFilter('submitted')} style={{ marginLeft: 'auto', background: '#1565c0', color: '#fff', border: 'none', borderRadius: 20, padding: '4px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>Filter</button>
          </div>
        )}

        <div className="bookings-toolbar">
          <div className="bookings-toolbar-left">
            <div className="bookings-search-box">
              <Search size={18} />
              <input type="text" placeholder="Search guest, property, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="bookings-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="bookings-filter-select" value={docsFilter} onChange={(e) => setDocsFilter(e.target.value)}>
              <option value="">All Docs</option>
              <option value="pending">No Docs Yet</option>
              <option value="submitted">Awaiting Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={() => setShowBlock(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 'auto', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, padding: '10px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            <CalendarPlus size={16} /> Block / Book Dates
          </button>
        </div>

        <div className="bookings-table-wrapper">
          {loading ? (
            <p style={{ padding: '40px', opacity: 0.6 }}>Loading bookings...</p>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>GUEST</th>
                  <th>PROPERTY</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>TOTAL</th>
                  <th>DEPOSIT</th>
                  <th>FULL PAY</th>
                  <th>DOCS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((b, idx) => {
                  const dc = DOCS_COLOR[b.docsStatus] || DOCS_COLOR.pending;
                  return (
                    <tr key={b.id} className={idx % 2 !== 0 ? 'bookings-row-alt' : ''}>
                      <td data-label="Guest" style={{ fontWeight: 600 }}>
                        {b.guestFirstName} {b.guestLastName}
                        {b.guestPhone && <div style={{ fontSize: '0.72rem', color: '#8b8b8b', fontWeight: 400, marginTop: 2 }}>{b.guestPhone}</div>}
                        {b.guestEmail && <div style={{ fontSize: '0.72rem', color: '#8b8b8b', fontWeight: 400 }}>{b.guestEmail}</div>}
                      </td>
                      <td data-label="Property">
                        {b.propertyTitle || '—'}
                        {b.propertyLocation && <div style={{ fontSize: '0.75rem', color: '#8b8b8b' }}>{b.propertyLocation}</div>}
                      </td>
                      <td data-label="Check-in">{b.checkIn}</td>
                      <td data-label="Check-out">{b.checkOut}</td>
                      <td data-label="Total" style={{ fontWeight: 700 }}>EGP {parseFloat(b.totalPrice || 0).toLocaleString()}</td>
                      <td data-label="Deposit">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.depositPaid ? '#2e7d32' : '#f57f17' }}>
                          {b.depositPaid ? 'Paid' : 'Pending'}
                          {b.depositAmount && <div style={{ fontWeight: 400, color: '#8b8b8b', fontSize: '0.7rem' }}>EGP {parseFloat(b.depositAmount).toLocaleString()}</div>}
                        </span>
                      </td>
                      <td data-label="Full pay">
                        {b.docsStatus === 'approved' ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: b.remainingPaid ? '#2e7d32' : '#1565c0' }}>
                            {b.remainingPaid ? '✓ Paid' : 'Awaiting'}
                            {b.totalPrice && b.depositAmount && !b.remainingPaid && (
                              <div style={{ fontWeight: 400, color: '#8b8b8b', fontSize: '0.7rem' }}>
                                EGP {(parseFloat(b.totalPrice) - parseFloat(b.depositAmount)).toLocaleString()}
                              </div>
                            )}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#ccc' }}>—</span>
                        )}
                      </td>
                      <td data-label="Docs">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: '0.73rem', fontWeight: 700, background: dc.bg, color: dc.text, border: 'none', cursor: 'pointer' }}
                        >
                          <FileText size={12} />
                          {b.docsStatus === 'submitted' ? 'Review' : b.docsStatus}
                        </button>
                      </td>
                      <td data-label="Status">
                        <StatusDropdown bookingId={b.id} currentStatus={b.status} onUpdated={handleStatusUpdated} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bookings-footer">
          <p className="bookings-results-count">Showing {filtered.length} of {pagination.total || 0} bookings</p>
          <div className="bookings-pagination">
            <button className="bookings-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <button className="bookings-page-btn active">{page}</button>
            <button className="bookings-page-btn" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
