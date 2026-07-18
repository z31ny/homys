import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, ChevronLeft, Tag, Percent, Star } from 'lucide-react';
import { adminAPI } from '../../services/api';
import './EditProperty.css';

const CLOUDINARY_CLOUD_NAME = 'dzpswgjsm';
const CLOUDINARY_UPLOAD_PRESET = 'homys_unsigned';

const AMENITIES_LIST = [
  'WiFi','Air Conditioning','Heating','Washer','Dryer','Dishwasher',
  'Coffee Machine','Microwave','Refrigerator','Oven','TV','Balcony',
  'Private Pool','Gym Access','Parking','Security System','Elevator',
  'Baby Crib','Iron','Workspace','Seating Area','Penthouse',
];

const PRESET_RULES = [
  'No pets allowed','No smoking','No parties or events','No unregistered guests',
  'Quiet hours after 11 PM','Not suitable for children','No mixed groups','Check-in 3:00 PM','Check-out 12:00 PM',
];

const LABEL_OPTIONS = [
  { value: '',               label: 'No label' },
  { value: 'best_seller',    label: 'Best Seller' },
  { value: 'guest_favorite', label: 'Guest Favorite' },
  { value: 'new',            label: 'New' },
];

const uploadToCloudinary = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  fd.append('folder', 'homys/properties');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Image upload failed');
  return (await res.json()).secure_url;
};

const SectionCard = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
    <h3 style={{ fontWeight: 800, color: '#112a3d', fontSize: '0.95rem', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 12, borderBottom: '1px solid #f0ece4' }}>{title}</h3>
    {children}
  </div>
);

const Field = ({ label, children, half }) => (
  <div style={{ flex: half ? '0 0 calc(50% - 8px)' : '1 1 100%', marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#112a3d', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e0d9ce', borderRadius: 10, fontSize: '0.9rem', fontFamily: 'inherit', color: '#112a3d', boxSizing: 'border-box', outline: 'none' };
const selectStyle = { ...inputStyle };

const EditProperty = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const propertyId = state?.propertyId;

  const [form, setForm] = useState({
    title: '', propertyType: 'apartment', propertyTypeOther: '',
    viewType: '', viewTypeOther: '', bedrooms: 1, bathrooms: 1,
    maxGuests: 2, pricePerNight: '', discountPercent: '', discountLabel: '',
    minimumStay: 1, propertyLabel: '', isFurnished: false,
    description: '', amenities: [], houseRules: [], customRule: '',
    customAmenity: '', offersHousekeeping: false, offersBeachAccess: false, beachAccessPrice: 2000, serviceFeePercent: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [uploading, setUploading] = useState('');
  const [existingImages, setExistingImages] = useState([]);  // images from the server
  const [heroActionLoading, setHeroActionLoading] = useState(null);  // imageId being set as hero
  const [deleteImageLoading, setDeleteImageLoading] = useState(null);  // imageId being deleted

  useEffect(() => {
    if (!propertyId) { setLoading(false); return; }
    adminAPI.getProperties({ limit: 200 })
      .then((res) => {
        const prop = (res.data.properties || []).find((p) => p.id === propertyId);
        if (prop) {
          setForm({
            title: prop.title || '',
            propertyType: prop.propertyType || 'apartment',
            propertyTypeOther: prop.propertyTypeOther || '',
            viewType: prop.viewType || '',
            viewTypeOther: prop.viewTypeOther || '',
            bedrooms: prop.bedrooms || 1,
            bathrooms: prop.bathrooms || 1,
            maxGuests: prop.maxGuests || 2,
            pricePerNight: prop.originalPricePerNight
              ? String(parseFloat(prop.originalPricePerNight))
              : prop.pricePerNight || '',
            discountPercent: prop.discountPercent ? String(parseFloat(prop.discountPercent)) : '',
            discountLabel: prop.discountLabel || '',
            minimumStay: prop.minimumStay || 1,
            propertyLabel: prop.propertyLabel || '',
            isFurnished: prop.isFurnished || false,
            description: prop.description || '',
            amenities: prop.amenities || [],
            houseRules: prop.houseRules || [],
            customRule: '',
            customAmenity: '',
            offersHousekeeping: !!prop.offersHousekeeping,
            offersBeachAccess: !!prop.offersBeachAccess,
            beachAccessPrice: prop.beachAccessPrice != null ? String(parseFloat(prop.beachAccessPrice)) : 2000,
            serviceFeePercent: prop.serviceFeePercent != null ? String(parseFloat(prop.serviceFeePercent)) : 10,
          });
          // Load existing images
          if (prop.images && Array.isArray(prop.images)) {
            setExistingImages(prop.images);
          }
        }
      })
      .catch(() => setError('Failed to load property.'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (a) => set('amenities', form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);
  const addCustomAmenity = () => {
    const t = form.customAmenity.trim();
    if (!t || form.amenities.includes(t)) return;
    set('amenities', [...form.amenities, t]);
    set('customAmenity', '');
  };
  const removeAmenity = (a) => set('amenities', form.amenities.filter((x) => x !== a));

  const toggleRule = (r) => set('houseRules', form.houseRules.includes(r) ? form.houseRules.filter((x) => x !== r) : [...form.houseRules, r]);
  const addCustomRule = () => {
    const t = form.customRule.trim();
    if (!t || form.houseRules.includes(t)) return;
    set('houseRules', [...form.houseRules, t]);
    set('customRule', '');
  };
  const removeRule = (r) => set('houseRules', form.houseRules.filter((x) => x !== r));


  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };
  const removeNewImage = (i) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.pricePerNight) { setError('Price per night is required.'); return; }
    setSaving(true); setError('');
    try {
      // Upload any new images
      let uploadedUrls = [];
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          setUploading(`Uploading image ${i + 1}/${newImages.length}…`);
          uploadedUrls.push(await uploadToCloudinary(newImages[i]));
        }
        setUploading('');
      }

      const payload = {
        title: form.title,
        propertyType: form.propertyType,
        propertyTypeOther: form.propertyType === 'other' ? form.propertyTypeOther : null,
        viewType: form.viewType || null,
        viewTypeOther: form.viewType === 'other' ? form.viewTypeOther : null,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        maxGuests: Number(form.maxGuests),
        pricePerNight: String(form.pricePerNight),
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
        discountLabel: form.discountLabel || null,
        minimumStay: Number(form.minimumStay) || 1,
        propertyLabel: form.propertyLabel || null,
        isFurnished: form.isFurnished,
        description: form.description,
        amenities: form.amenities,
        houseRules: form.houseRules,
        newImageUrls: uploadedUrls,
        offersHousekeeping: form.offersHousekeeping,
        offersBeachAccess: form.offersBeachAccess,
        beachAccessPrice: form.beachAccessPrice === '' ? 2000 : Number(form.beachAccessPrice),
        serviceFeePercent: form.serviceFeePercent === '' ? 10 : Number(form.serviceFeePercent),
      };

      const res = await adminAPI.updateProperty(propertyId, payload);
      // Append the newly-saved images to the existing list and clear the staging area
      if (uploadedUrls.length > 0) {
        const saved = res?.data?.property?.images;
        if (Array.isArray(saved)) {
          setExistingImages(saved);
        } else {
          setExistingImages((prev) => [...prev, ...uploadedUrls.map((url, i) => ({ id: `tmp-${Date.now()}-${i}`, imageUrl: url, isHero: prev.length === 0 && i === 0, displayOrder: prev.length + i }))]);
        }
        newPreviews.forEach((u) => URL.revokeObjectURL(u));
        setNewImages([]);
        setNewPreviews([]);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[EditProperty] save error:', err);
      setError(err.message || `Save failed (${err.status || 'network error'}). Check browser console for details.`);
    } finally {
      setSaving(false);
      setUploading('');
    }
  };

  if (!propertyId) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ opacity: 0.5 }}>No property selected. Go to Properties and click Edit.</p>
        <button onClick={() => navigate('/admin/properties')} style={{ marginTop: 20, padding: '10px 24px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: 700 }}>Back to Properties</button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 48, opacity: 0.5 }}>Loading property…</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/admin/properties')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#8b8b8b', fontWeight: 700, fontSize: '0.85rem' }}>
            <ChevronLeft size={18} /> Properties
          </button>
          <span style={{ color: '#e0d9ce' }}>/</span>
          <h2 style={{ color: '#112a3d', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Edit Property</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/admin/properties')} style={{ padding: '10px 20px', border: '1.5px solid #e0d9ce', borderRadius: 50, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
            <X size={15} /> Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          style={{ position: 'sticky', top: 80, zIndex: 100, background: '#fde8e8', border: '2px solid #e53935', borderRadius: 10, padding: '14px 18px', color: '#b71c1c', fontWeight: 700, marginBottom: 20, fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}
      {success && <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 10, padding: '12px 16px', color: '#2e7d32', fontWeight: 700, marginBottom: 20 }}>✅ Property saved successfully.</div>}
      {uploading && <div style={{ background: '#e8f4fd', border: '1px solid #b3d7f2', borderRadius: 10, padding: '12px 16px', color: '#1565c0', fontWeight: 600, marginBottom: 20 }}>{uploading}</div>}

      {/* Basic Info */}
      <SectionCard title="Basic Info">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Field label="Property Title *">
            <input style={inputStyle} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Property Type" half>
            <select style={selectStyle} value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="chalet">Chalet</option>
              <option value="studio">Studio</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {form.propertyType === 'other' && (
            <Field label="Specify Type" half>
              <input style={inputStyle} placeholder="e.g. Penthouse" value={form.propertyTypeOther} onChange={(e) => set('propertyTypeOther', e.target.value)} />
            </Field>
          )}
          <Field label="View Type" half>
            <select style={selectStyle} value={form.viewType} onChange={(e) => set('viewType', e.target.value)}>
              <option value="">No view specified</option>
              <option value="sea">Sea</option>
              <option value="pool">Pool</option>
              <option value="garden">Garden</option>
              <option value="city">City</option>
              <option value="lagoon">Lagoon</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {form.viewType === 'other' && (
            <Field label="Specify View" half>
              <input style={inputStyle} placeholder="e.g. Mountain" value={form.viewTypeOther} onChange={(e) => set('viewTypeOther', e.target.value)} />
            </Field>
          )}
          <Field label="Bedrooms" half><input style={inputStyle} type="number" min="0" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} /></Field>
          <Field label="Bathrooms" half><input style={inputStyle} type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></Field>
          <Field label="Max Guests" half><input style={inputStyle} type="number" min="1" value={form.maxGuests} onChange={(e) => set('maxGuests', e.target.value)} /></Field>
          <Field label="Minimum Stay (nights)" half><input style={inputStyle} type="number" min="1" value={form.minimumStay} onChange={(e) => set('minimumStay', e.target.value)} /></Field>
          <Field label="Furnished?">
            <div style={{ display: 'flex', gap: 10 }}>
              {['Yes', 'No'].map((opt) => (
                <button key={opt} type="button" onClick={() => set('isFurnished', opt === 'Yes')}
                  style={{ padding: '8px 22px', borderRadius: 50, border: '1.5px solid', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', background: (form.isFurnished ? 'Yes' : 'No') === opt ? '#112a3d' : '#fff', color: (form.isFurnished ? 'Yes' : 'No') === opt ? '#f6f3eb' : '#112a3d', borderColor: (form.isFurnished ? 'Yes' : 'No') === opt ? '#112a3d' : '#e0d9ce' }}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Description (one feature per line)">
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Each line becomes a bullet point for guests." />
        </Field>
      </SectionCard>

      {/* Pricing & Discount */}
      <SectionCard title="Pricing & Discount">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <Field label="Price per Night (EGP) *" half>
            <input style={inputStyle} type="number" min="0" value={form.pricePerNight} onChange={(e) => set('pricePerNight', e.target.value)} />
          </Field>
          <Field label="Unit Discount %" half>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inputStyle, paddingRight: 36 }} type="number" min="0" max="99" step="0.5" placeholder="e.g. 15" value={form.discountPercent} onChange={(e) => set('discountPercent', e.target.value)} />
              <Percent size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            </div>
          </Field>
          <Field label="Discount Label" half>
            <input style={inputStyle} placeholder="e.g. Summer Special" value={form.discountLabel} onChange={(e) => set('discountLabel', e.target.value)} />
          </Field>
        </div>
        {form.discountPercent > 0 && form.pricePerNight > 0 && (
          <div style={{ marginTop: 8, padding: '10px 16px', background: '#f9f6f1', borderRadius: 10, fontSize: '0.85rem', color: '#112a3d' }}>
            Preview: <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>EGP {parseFloat(form.pricePerNight).toLocaleString()}</span>
            {' → '}
            <strong style={{ color: '#c4a369' }}>EGP {(parseFloat(form.pricePerNight) * (1 - parseFloat(form.discountPercent) / 100)).toLocaleString('en', { maximumFractionDigits: 0 })}</strong>
            {' / night'}
          </div>
        )}
      </SectionCard>

      {/* Label Badge */}
      <SectionCard title="Listing Badge">
        <p style={{ fontSize: '0.82rem', color: '#8b8b8b', margin: '0 0 14px' }}>Show a badge on this listing card to highlight it to guests.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {LABEL_OPTIONS.map((opt) => {
            const LABEL_STYLES = {
              '': { bg: '#f0ece4', color: '#112a3d', border: '#e0d9ce' },
              best_seller: { bg: '#fff8e1', color: '#e65100', border: '#ffcc02' },
              guest_favorite: { bg: '#fce4ec', color: '#880e4f', border: '#f48fb1' },
              new: { bg: '#e8f5e9', color: '#1b5e20', border: '#a5d6a7' },
            };
            const s = LABEL_STYLES[opt.value] || LABEL_STYLES[''];
            const isActive = form.propertyLabel === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => set('propertyLabel', opt.value)}
                style={{ padding: '8px 18px', borderRadius: 50, border: `2px solid ${isActive ? s.border : '#e0d9ce'}`, background: isActive ? s.bg : '#fff', color: isActive ? s.color : '#8b8b8b', fontWeight: isActive ? 800 : 600, cursor: 'pointer', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                {opt.value && <Star size={13} fill={isActive ? s.color : 'none'} stroke={isActive ? s.color : '#8b8b8b'} />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Amenities */}
      <SectionCard title="Amenities">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
          {AMENITIES_LIST.map((a) => (
            <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1.5px solid ${form.amenities.includes(a) ? '#112a3d' : '#e0d9ce'}`, borderRadius: 10, background: form.amenities.includes(a) ? '#f0ece4' : '#fff', fontSize: '0.83rem', fontWeight: 600, color: '#112a3d' }}>
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} style={{ display: 'none' }} />
              <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.amenities.includes(a) ? '#112a3d' : '#ccc'}`, background: form.amenities.includes(a) ? '#112a3d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.amenities.includes(a) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {a}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Add custom amenity…" value={form.customAmenity} onChange={(e) => set('customAmenity', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }} />
          <button type="button" onClick={addCustomAmenity} style={{ padding: '10px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Add</button>
        </div>
        {form.amenities.filter((a) => !AMENITIES_LIST.includes(a)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {form.amenities.filter((a) => !AMENITIES_LIST.includes(a)).map((a) => (
              <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#112a3d', color: '#f6f3eb', padding: '5px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                {a}
                <button type="button" onClick={() => removeAmenity(a)} style={{ background: 'none', border: 'none', color: '#f6f3eb', cursor: 'pointer', padding: 0, opacity: 0.7 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* House Rules */}
      <SectionCard title="House Rules">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
          {PRESET_RULES.map((r) => (
            <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 12px', border: `1.5px solid ${form.houseRules.includes(r) ? '#112a3d' : '#e0d9ce'}`, borderRadius: 10, background: form.houseRules.includes(r) ? '#f0ece4' : '#fff', fontSize: '0.83rem', fontWeight: 600, color: '#112a3d' }}>
              <input type="checkbox" checked={form.houseRules.includes(r)} onChange={() => toggleRule(r)} style={{ display: 'none' }} />
              <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${form.houseRules.includes(r) ? '#112a3d' : '#ccc'}`, background: form.houseRules.includes(r) ? '#112a3d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.houseRules.includes(r) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {r}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="Add custom rule…" value={form.customRule} onChange={(e) => set('customRule', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomRule(); } }} />
          <button type="button" onClick={addCustomRule} style={{ padding: '10px 20px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Add</button>
        </div>
        {form.houseRules.filter((r) => !PRESET_RULES.includes(r)).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {form.houseRules.filter((r) => !PRESET_RULES.includes(r)).map((r) => (
              <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#112a3d', color: '#f6f3eb', padding: '5px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 700 }}>
                {r}
                <button type="button" onClick={() => removeRule(r)} style={{ background: 'none', border: 'none', color: '#f6f3eb', cursor: 'pointer', padding: 0, opacity: 0.7 }}>✕</button>
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Extra Fees */}
      <SectionCard title="Extra Fees & Service Fee">
        <p style={{ fontSize: '0.82rem', color: '#8b8b8b', margin: '0 0 16px' }}>A refundable insurance fee (= 1 night) is added to every booking automatically. Tick any extra fees this property charges — they're mandatory.</p>
        {[
          { key: 'offersHousekeeping', label: 'Housekeeping — EGP 2,000 / stay' },
          { key: 'offersBeachAccess', label: `Beach Access — EGP ${Number(form.beachAccessPrice || 0).toLocaleString()} / week per guest` },
        ].map(({ key, label }) => {
          const checked = !!form[key];
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 0', fontWeight: 600, color: '#112a3d', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={checked} onChange={(e) => set(key, e.target.checked)} style={{ display: 'none' }} />
              <span style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? '#112a3d' : '#c9c2b5'}`, background: checked ? '#112a3d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12" /></svg>}
              </span>
              {label}
            </label>
          );
        })}
        {form.offersBeachAccess && (
          <div style={{ margin: '4px 0 6px 30px', maxWidth: 260 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#112a3d', marginBottom: 6 }}>Beach Access Price (EGP / week / guest)</label>
            <input style={inputStyle} type="number" min="0" step="50" value={form.beachAccessPrice} onChange={(e) => set('beachAccessPrice', e.target.value)} />
          </div>
        )}
        <div style={{ marginTop: 18, maxWidth: 260 }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#112a3d', marginBottom: 6 }}>Service Fee (%)</label>
          <input style={inputStyle} type="number" min="0" max="100" step="0.5" value={form.serviceFeePercent} onChange={(e) => set('serviceFeePercent', e.target.value)} />
        </div>
      </SectionCard>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <SectionCard title="Existing Images">
          <p style={{ fontSize: '0.82rem', color: '#8b8b8b', margin: '0 0 16px' }}>Click "Set as Cover" to change the main photo. The cover photo appears first in listings.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {existingImages.map((img) => (
              <div key={img.id} style={{ position: 'relative', border: img.isHero ? '3px solid #d1a67a' : '2px solid #e0d9ce', borderRadius: 14, overflow: 'hidden', width: 160 }}>
                <img src={img.imageUrl} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {img.isHero ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#d1a67a', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>★ Cover</span>
                  ) : (
                    <button
                      onClick={async () => {
                        setHeroActionLoading(img.id);
                        try {
                          await adminAPI.setHeroImage(propertyId, img.id);
                          setExistingImages((prev) => prev.map((i) => ({ ...i, isHero: i.id === img.id })));
                        } catch (err) { alert(err.message || 'Failed to set cover photo.'); }
                        finally { setHeroActionLoading(null); }
                      }}
                      disabled={heroActionLoading === img.id}
                      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #d1a67a', background: '#fff8f0', color: '#c17f3a', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', opacity: heroActionLoading === img.id ? 0.5 : 1 }}
                    >
                      {heroActionLoading === img.id ? '…' : 'Set as Cover'}
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this image?')) return;
                      setDeleteImageLoading(img.id);
                      try {
                        await adminAPI.deletePropertyImage(propertyId, img.id);
                        setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
                      } catch (err) { alert(err.message || 'Failed to delete image.'); }
                      finally { setDeleteImageLoading(null); }
                    }}
                    disabled={deleteImageLoading === img.id}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', opacity: deleteImageLoading === img.id ? 0.5 : 1 }}
                  >
                    {deleteImageLoading === img.id ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Add Images */}
      <SectionCard title="Add More Images">
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f5f2ec', border: '1.5px dashed #c4a369', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#112a3d' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
          Upload Images
          <input type="file" multiple accept="image/*" onChange={handleImageAdd} style={{ display: 'none' }} />
        </label>
        {newPreviews.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
            {newPreviews.map((url, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 10, border: '2px solid #e0d9ce' }} />
                <button type="button" onClick={() => removeNewImage(i)}
                  style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            ))}
          </div>
        )}
        <p style={{ fontSize: '0.78rem', color: '#8b8b8b', marginTop: 10 }}>Images will be uploaded when you save. Existing images are preserved.</p>
      </SectionCard>

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
        <button onClick={() => navigate('/admin/properties')} style={{ padding: '12px 24px', border: '1.5px solid #e0d9ce', borderRadius: 50, background: '#fff', cursor: 'pointer', fontWeight: 700, color: '#666' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditProperty;
