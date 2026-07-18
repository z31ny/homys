import React, { useState, useEffect, useCallback } from 'react';
import {
  Save, RefreshCw, ChevronDown, ChevronUp,
  Plus, Trash2, Upload, Globe,
} from 'lucide-react';
import { contentAPI, adminAPI } from '../../services/api';
import { invalidateCache } from '../../useCMS';

// ── R2 image uploader ──────────────────────────────────────────────────────
async function uploadImage(file) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image is over 10MB — please use a smaller file.');
  }
  // Import at top won't work for this pattern, so inline-import
  const { uploadImageToR2 } = await import('../../services/api');
  return uploadImageToR2(file, 'site-content');
}

// ── Shared tiny components ─────────────────────────────────────────────────
const inp = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e0d9ce',
  borderRadius: 9, fontSize: '0.88rem', fontFamily: 'inherit',
  color: '#112a3d', boxSizing: 'border-box', background: '#fff', outline: 'none',
};
const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8b8b8b', marginBottom: 5 }}>
    {children}
  </label>
);
const Field = ({ label, children, style }) => (
  <div style={{ marginBottom: 14, ...style }}>
    {label && <Label>{label}</Label>}
    {children}
  </div>
);
const Divider = () => <div style={{ height: 1, background: '#f0ece4', margin: '18px 0' }} />;

// ── Image upload field ─────────────────────────────────────────────────────
const ImageField = ({ label, value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { onChange(await uploadImage(file)); }
    catch (err) { console.error('[WebsiteContent] image upload:', err); alert(err.message || 'Image upload failed. Try again.'); }
    finally { setUploading(false); e.target.value = ''; }
  };
  return (
    <Field label={label}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {value && (
          <img src={value} alt="preview" style={{ height: 60, borderRadius: 8, border: '1.5px solid #e0d9ce', objectFit: 'cover', maxWidth: 100 }} />
        )}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: uploading ? '#f0ece4' : '#fff', border: '1.5px dashed #c4a369', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.78rem', color: '#112a3d' }}>
          {uploading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
          {uploading ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={handle} disabled={uploading} style={{ display: 'none' }} />
        </label>
        {value && (
          <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
        )}
      </div>
      {value && <p style={{ fontSize: '0.7rem', color: '#8b8b8b', marginTop: 4, wordBreak: 'break-all' }}>{value.slice(0, 80)}…</p>}
    </Field>
  );
};

// ── Section card wrapper ───────────────────────────────────────────────────
const SectionCard = ({ title, description, saving, saved, onSave, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#fff', border: '1.5px solid #e8e0d4', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', padding: '16px 22px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#112a3d', margin: 0 }}>{title}</p>
          {description && <p style={{ fontSize: '0.75rem', color: '#8b8b8b', margin: '2px 0 0' }}>{description}</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saved && <span style={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 800 }}>✓ Saved</span>}
          {open ? <ChevronUp size={16} color="#8b8b8b" /> : <ChevronDown size={16} color="#8b8b8b" />}
        </div>
      </button>

      {open && (
        <div style={{ padding: '4px 22px 22px', borderTop: '1px solid #f0ece4' }}>
          <div style={{ paddingTop: 18 }}>
            {children}
            <button onClick={onSave} disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, padding: '10px 22px', background: '#112a3d', color: '#f6f3eb', border: 'none', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, fontFamily: 'inherit' }}>
              {saving ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
              {saving ? 'Saving…' : 'Save Section'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Page tab ──────────────────────────────────────────────────────────────
const PageTab = ({ pages, active, onChange }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
    {pages.map((p) => (
      <button key={p.key} onClick={() => onChange(p.key)}
        style={{ padding: '8px 18px', borderRadius: 50, fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', border: '2px solid', fontFamily: 'inherit',
          background: active === p.key ? '#112a3d' : '#fff',
          color: active === p.key ? '#f6f3eb' : '#112a3d',
          borderColor: active === p.key ? '#112a3d' : '#e0d9ce' }}>
        {p.label}
      </button>
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// Section editors
// ══════════════════════════════════════════════════════════════════════════

const tf = (c, key) => c?.[key] ?? '';

const HomeHeroEditor = ({ c, set }) => (
  <ImageField label="Hero Background Image" value={tf(c,'backgroundImage')} onChange={(v) => set('backgroundImage', v)} />
);

const HomeServicesEditor = ({ c, set }) => {
  const cards = c?.cards || [{ title: '', image: '' }, { title: '', image: '' }, { title: '', image: '' }];
  const updCard = (i, key, val) => { const n = [...cards]; n[i] = { ...n[i], [key]: val }; set('cards', n); };
  return (
    <>
      <Field label="Section Background Label"><input style={inp} value={tf(c,'sectionLabel')} onChange={(e) => set('sectionLabel', e.target.value)} /></Field>
      <Divider />
      <Label>Service Cards</Label>
      {cards.map((card, i) => (
        <div key={i} style={{ background: '#f9f6f1', borderRadius: 10, padding: '14px', marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b8b8b', margin: '0 0 10px' }}>Card {i + 1}</p>
          <Field label="Title"><input style={inp} value={card.title || ''} onChange={(e) => updCard(i, 'title', e.target.value)} /></Field>
          <ImageField label="Image" value={card.image || ''} onChange={(v) => updCard(i, 'image', v)} />
        </div>
      ))}
    </>
  );
};

const HomeSeaEditor = ({ c, set }) => (
  <>
    <Field label="Title (use \n for line breaks)"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
    <Field label="Button Text"><input style={inp} value={tf(c,'buttonText')} onChange={(e) => set('buttonText', e.target.value)} /></Field>
    <Field label="Button Link"><input style={inp} value={tf(c,'buttonLink')} onChange={(e) => set('buttonLink', e.target.value)} /></Field>
  </>
);

const HomeQuizEditor = ({ c, set }) => (
  <>
    <Field label="Tag"><input style={inp} value={tf(c,'tag')} onChange={(e) => set('tag', e.target.value)} /></Field>
    <Field label="Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
    <Field label="Button Text"><input style={inp} value={tf(c,'buttonText')} onChange={(e) => set('buttonText', e.target.value)} /></Field>
    <ImageField label="Section Image" value={tf(c,'image')} onChange={(v) => set('image', v)} />
  </>
);

const HomeDestinationsEditor = ({ c, set }) => {
  const dests = c?.destinations || [];
  const updDest = (i, key, val) => { const n = [...dests]; n[i] = { ...n[i], [key]: val }; set('destinations', n); };
  return (
    <>
      <Field label="Section Title (use \n for line breaks)"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'sectionTitle')} onChange={(e) => set('sectionTitle', e.target.value)} /></Field>
      <Field label="Section Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'sectionSubtitle')} onChange={(e) => set('sectionSubtitle', e.target.value)} /></Field>
      <Field label="Explore Button Text"><input style={inp} value={tf(c,'exploreButtonText')} onChange={(e) => set('exploreButtonText', e.target.value)} /></Field>
      <Divider />
      <Label>Destination Cards</Label>
      {dests.map((d, i) => (
        <div key={i} style={{ background: '#f9f6f1', borderRadius: 10, padding: '14px', marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: '0.78rem', color: '#8b8b8b', margin: '0 0 10px' }}>Destination {i + 1}</p>
          <Field label="Title"><input style={inp} value={d.title || ''} onChange={(e) => updDest(i, 'title', e.target.value)} /></Field>
          <Field label="Search Keyword (used for property count)"><input style={inp} value={d.keyword || ''} onChange={(e) => updDest(i, 'keyword', e.target.value)} /></Field>
          <ImageField label="Card Image" value={d.image || ''} onChange={(v) => updDest(i, 'image', v)} />
        </div>
      ))}
    </>
  );
};

const HomeAboutEditor = ({ c, set }) => (
  <>
    <Field label="Heading (use \n for line breaks)"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'heading')} onChange={(e) => set('heading', e.target.value)} /></Field>
    <Field label="Body Text"><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={tf(c,'subtext')} onChange={(e) => set('subtext', e.target.value)} /></Field>
    <Field label="Button Text"><input style={inp} value={tf(c,'buttonText')} onChange={(e) => set('buttonText', e.target.value)} /></Field>
    <Divider />
    <ImageField label="Left Image" value={tf(c,'image1')} onChange={(v) => set('image1', v)} />
    <ImageField label="Right Image" value={tf(c,'image2')} onChange={(v) => set('image2', v)} />
    <ImageField label="Logo Image" value={tf(c,'logo')} onChange={(v) => set('logo', v)} />
  </>
);

const HomeListPropertyEditor = ({ c, set }) => {
  const benefits = c?.benefits || [];
  const updBenefit = (i, val) => { const n = [...benefits]; n[i] = val; set('benefits', n); };
  const addBenefit = () => set('benefits', [...benefits, '']);
  const removeBenefit = (i) => set('benefits', benefits.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Tag"><input style={inp} value={tf(c,'tag')} onChange={(e) => set('tag', e.target.value)} /></Field>
      <Field label="Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
      <Field label="Button Text"><input style={inp} value={tf(c,'buttonText')} onChange={(e) => set('buttonText', e.target.value)} /></Field>
      <ImageField label="Section Image" value={tf(c,'image')} onChange={(v) => set('image', v)} />
      <Divider />
      <Label>Benefits List</Label>
      {benefits.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input style={{ ...inp, flex: 1 }} value={b} onChange={(e) => updBenefit(i, e.target.value)} placeholder={`Benefit ${i + 1}`} />
          <button onClick={() => removeBenefit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={15} /></button>
        </div>
      ))}
      <button onClick={addBenefit} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Benefit
      </button>
    </>
  );
};

const FaqEditor = ({ c, set }) => {
  const items = c?.items || [];
  const updItem = (i, key, val) => { const n = [...items]; n[i] = { ...n[i], [key]: val }; set('items', n); };
  const addItem = () => set('items', [...items, { question: '', answer: '' }]);
  const removeItem = (i) => set('items', items.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'sectionTitle')} onChange={(e) => set('sectionTitle', e.target.value)} /></Field>
      <Field label="Show More Button Text"><input style={inp} value={tf(c,'showMoreButtonText')} onChange={(e) => set('showMoreButtonText', e.target.value)} /></Field>
      <Divider />
      <Label>FAQ Items</Label>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#f9f6f1', border: '1px solid #e8e0d4', borderRadius: 10, padding: '14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b8b8b', textTransform: 'uppercase' }}>Q {i + 1}</span>
            <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
          </div>
          <Field label="Question"><input style={inp} value={item.question || ''} onChange={(e) => updItem(i, 'question', e.target.value)} /></Field>
          <Field label="Answer"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={item.answer || ''} onChange={(e) => updItem(i, 'answer', e.target.value)} /></Field>
        </div>
      ))}
      <button onClick={addItem} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add FAQ Item
      </button>
    </>
  );
};

const StaysHeroEditor = ({ c, set }) => {
  const pills = c?.filterPills || [];
  const updPill = (i, val) => { const n = [...pills]; n[i] = val; set('filterPills', n); };
  return (
    <>
      <ImageField label="Hero Background Image" value={tf(c,'backgroundImage')} onChange={(v) => set('backgroundImage', v)} />
      <Divider />
      <Label>Filter Pill Labels</Label>
      {pills.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={p} onChange={(e) => updPill(i, e.target.value)} placeholder={`Pill ${i + 1}`} />
          <button onClick={() => set('filterPills', pills.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => set('filterPills', [...pills, ''])} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Pill
      </button>
    </>
  );
};

const StaysPartnersEditor = ({ c, set }) => {
  const thumbs = c?.thumbnails || ['', '', '', ''];
  const updThumb = (i, val) => { const n = [...thumbs]; n[i] = val; set('thumbnails', n); };
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Divider />
      <ImageField label="Featured Partner Image" value={tf(c,'featuredImage')} onChange={(v) => set('featuredImage', v)} />
      <Field label="Featured Partner Title"><input style={inp} value={tf(c,'featuredTitle')} onChange={(e) => set('featuredTitle', e.target.value)} /></Field>
      <Field label="Featured Partner Subtitle"><input style={inp} value={tf(c,'featuredSubtitle')} onChange={(e) => set('featuredSubtitle', e.target.value)} /></Field>
      <Divider />
      <Label>Thumbnail Images</Label>
      {thumbs.map((t, i) => (
        <ImageField key={i} label={`Thumbnail ${i + 1}`} value={t} onChange={(v) => updThumb(i, v)} />
      ))}
    </>
  );
};

const AboutHeroEditor = ({ c, set }) => (
  <>
    <Field label="Headline (use \n for line breaks)"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="Word to Highlight (must appear in Headline)"><input style={inp} value={tf(c,'highlightWord')} onChange={(e) => set('highlightWord', e.target.value)} /></Field>
    <Field label="Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
  </>
);

const AboutMissionEditor = ({ c, set }) => (
  <>
    <Field label="Banner Text"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'bannerText')} onChange={(e) => set('bannerText', e.target.value)} /></Field>
    <ImageField label="Split Section Image" value={tf(c,'splitImage')} onChange={(v) => set('splitImage', v)} />
    <Field label="Split Title"><input style={inp} value={tf(c,'splitTitle')} onChange={(e) => set('splitTitle', e.target.value)} /></Field>
    <Field label="Split Body"><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={tf(c,'splitBody')} onChange={(e) => set('splitBody', e.target.value)} /></Field>
  </>
);

const AboutStatsEditor = ({ c, set }) => {
  const stats = c?.stats || [];
  const upd = (i, key, val) => { const n = [...stats]; n[i] = { ...n[i], [key]: val }; set('stats', n); };
  return (
    <>
      <Label>Statistics</Label>
      {stats.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Value</Label>
            <input style={inp} value={s.value || ''} onChange={(e) => upd(i, 'value', e.target.value)} placeholder="e.g. 5000" />
          </div>
          <div style={{ width: 70 }}>
            <Label>Suffix</Label>
            <input style={inp} value={s.suffix || ''} onChange={(e) => upd(i, 'suffix', e.target.value)} placeholder="e.g. +" />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Label</Label>
            <input style={inp} value={s.label || ''} onChange={(e) => upd(i, 'label', e.target.value)} placeholder="e.g. Happy Guests" />
          </div>
        </div>
      ))}
    </>
  );
};

const AboutWhyEditor = ({ c, set }) => {
  const cards = c?.cards || [];
  const upd = (i, key, val) => { const n = [...cards]; n[i] = { ...n[i], [key]: val }; set('cards', n); };
  const add = () => set('cards', [...cards, { title: '', body: '' }]);
  const remove = (i) => set('cards', cards.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Divider />
      {cards.map((card, i) => (
        <div key={i} style={{ background: '#f9f6f1', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b8b8b', textTransform: 'uppercase' }}>Card {i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
          </div>
          <Field label="Title"><input style={inp} value={card.title || ''} onChange={(e) => upd(i, 'title', e.target.value)} /></Field>
          <Field label="Body"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={card.body || ''} onChange={(e) => upd(i, 'body', e.target.value)} /></Field>
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Card
      </button>
    </>
  );
};

const AboutVisionMissionEditor = ({ c, set }) => (
  <>
    <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Divider />
    <Field label="Vision Card Title"><input style={inp} value={tf(c,'visionTitle')} onChange={(e) => set('visionTitle', e.target.value)} /></Field>
    <Field label="Vision Body"><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={tf(c,'visionBody')} onChange={(e) => set('visionBody', e.target.value)} /></Field>
    <Divider />
    <Field label="Mission Card Title"><input style={inp} value={tf(c,'missionTitle')} onChange={(e) => set('missionTitle', e.target.value)} /></Field>
    <Field label="Mission Body"><textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={tf(c,'missionBody')} onChange={(e) => set('missionBody', e.target.value)} /></Field>
  </>
);

const AboutFoundersEditor = ({ c, set }) => {
  const founders = c?.founders || [];
  const upd = (i, key, val) => { const n = [...founders]; n[i] = { ...n[i], [key]: val }; set('founders', n); };
  const add = () => set('founders', [...founders, { name: '', role: '', bio: '', image: '' }]);
  const remove = (i) => set('founders', founders.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Divider />
      {founders.map((f, i) => (
        <div key={i} style={{ background: '#f9f6f1', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b8b8b', textTransform: 'uppercase' }}>Founder {i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
          </div>
          <Field label="Name"><input style={inp} value={f.name || ''} onChange={(e) => upd(i, 'name', e.target.value)} /></Field>
          <Field label="Role"><input style={inp} value={f.role || ''} onChange={(e) => upd(i, 'role', e.target.value)} /></Field>
          <Field label="Bio"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={f.bio || ''} onChange={(e) => upd(i, 'bio', e.target.value)} /></Field>
          <ImageField label="Photo" value={f.image || ''} onChange={(v) => upd(i, 'image', v)} />
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Founder
      </button>
    </>
  );
};

const AboutTimelineEditor = ({ c, set }) => {
  const events = c?.events || [];
  const upd = (i, key, val) => { const n = [...events]; n[i] = { ...n[i], [key]: val }; set('events', n); };
  const add = () => set('events', [...events, { year: '', text: '' }]);
  const remove = (i) => set('events', events.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Divider />
      {events.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 80 }}>
            <Label>Year</Label>
            <input style={inp} value={ev.year || ''} onChange={(e) => upd(i, 'year', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Description</Label>
            <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={ev.text || ''} onChange={(e) => upd(i, 'text', e.target.value)} />
          </div>
          <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginTop: 22 }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Event
      </button>
    </>
  );
};

const AboutGalleryEditor = ({ c, set }) => {
  const images = c?.images || ['', '', '', ''];
  const upd = (i, val) => { const n = [...images]; n[i] = val; set('images', n); };
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
      <Divider />
      {images.map((img, i) => (
        <ImageField key={i} label={`Gallery Image ${i + 1}`} value={img} onChange={(v) => upd(i, v)} />
      ))}
    </>
  );
};

const AboutTestimonialsEditor = ({ c, set }) => {
  const testimonials = c?.testimonials || [];
  const upd = (i, key, val) => { const n = [...testimonials]; n[i] = { ...n[i], [key]: val }; set('testimonials', n); };
  const add = () => set('testimonials', [...testimonials, { quote: '', name: '', origin: '' }]);
  const remove = (i) => set('testimonials', testimonials.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Section Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Divider />
      {testimonials.map((t, i) => (
        <div key={i} style={{ background: '#f9f6f1', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b8b8b', textTransform: 'uppercase' }}>Testimonial {i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
          </div>
          <Field label="Quote"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={t.quote || ''} onChange={(e) => upd(i, 'quote', e.target.value)} /></Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Name" style={{ flex: 1 }}><input style={inp} value={t.name || ''} onChange={(e) => upd(i, 'name', e.target.value)} /></Field>
            <Field label="Origin (e.g. Guest from UK)" style={{ flex: 1 }}><input style={inp} value={t.origin || ''} onChange={(e) => upd(i, 'origin', e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Testimonial
      </button>
    </>
  );
};

const AboutCtaEditor = ({ c, set }) => (
  <>
    <Field label="Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="Subtitle"><input style={inp} value={tf(c,'subtitle')} onChange={(e) => set('subtitle', e.target.value)} /></Field>
    <div style={{ display: 'flex', gap: 10 }}>
      <Field label="Primary Button Text" style={{ flex: 1 }}><input style={inp} value={tf(c,'primaryButtonText')} onChange={(e) => set('primaryButtonText', e.target.value)} /></Field>
      <Field label="Primary Button Link" style={{ flex: 1 }}><input style={inp} value={tf(c,'primaryButtonLink')} onChange={(e) => set('primaryButtonLink', e.target.value)} /></Field>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <Field label="Secondary Button Text" style={{ flex: 1 }}><input style={inp} value={tf(c,'secondaryButtonText')} onChange={(e) => set('secondaryButtonText', e.target.value)} /></Field>
      <Field label="Secondary Button Link" style={{ flex: 1 }}><input style={inp} value={tf(c,'secondaryButtonLink')} onChange={(e) => set('secondaryButtonLink', e.target.value)} /></Field>
    </div>
  </>
);

const ContactPageEditor = ({ c, set }) => (
  <>
    <Field label="Hero Title"><input style={inp} value={tf(c,'heroTitle')} onChange={(e) => set('heroTitle', e.target.value)} /></Field>
    <Field label="Hero Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'heroSubtitle')} onChange={(e) => set('heroSubtitle', e.target.value)} /></Field>
    <Field label="Form Title"><input style={inp} value={tf(c,'formTitle')} onChange={(e) => set('formTitle', e.target.value)} /></Field>
    <Divider />
    <Field label="Office Address (\n for line break)"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'office')} onChange={(e) => set('office', e.target.value)} /></Field>
    <div style={{ display: 'flex', gap: 10 }}>
      <Field label="Email" style={{ flex: 1 }}><input style={inp} value={tf(c,'email')} onChange={(e) => set('email', e.target.value)} /></Field>
      <Field label="Phone" style={{ flex: 1 }}><input style={inp} value={tf(c,'phone')} onChange={(e) => set('phone', e.target.value)} /></Field>
    </div>
    <Field label="Working Hours (\n for line break)"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'workingHours')} onChange={(e) => set('workingHours', e.target.value)} /></Field>
    <Divider />
    <Field label="Instagram URL"><input style={inp} value={tf(c,'instagramUrl')} onChange={(e) => set('instagramUrl', e.target.value)} /></Field>
    <Field label="Facebook URL"><input style={inp} value={tf(c,'facebookUrl')} onChange={(e) => set('facebookUrl', e.target.value)} /></Field>
    <Field label="LinkedIn URL"><input style={inp} value={tf(c,'linkedinUrl')} onChange={(e) => set('linkedinUrl', e.target.value)} /></Field>
  </>
);

const FaqPageEditor = ({ c, set }) => {
  const items = c?.items || [];
  const upd = (i, key, val) => { const n = [...items]; n[i] = { ...n[i], [key]: val }; set('items', n); };
  const add = () => set('items', [...items, { question: '', answer: '' }]);
  const remove = (i) => set('items', items.filter((_, idx) => idx !== i));
  return (
    <>
      <Field label="Page Title"><input style={inp} value={tf(c,'title')} onChange={(e) => set('title', e.target.value)} /></Field>
      <Field label="CTA Title"><input style={inp} value={tf(c,'ctaTitle')} onChange={(e) => set('ctaTitle', e.target.value)} /></Field>
      <Field label="CTA Subtitle"><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'ctaSubtitle')} onChange={(e) => set('ctaSubtitle', e.target.value)} /></Field>
      <Divider />
      <Label>FAQ Items</Label>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#f9f6f1', border: '1px solid #e8e0d4', borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8b8b8b', textTransform: 'uppercase' }}>Q {i + 1}</span>
            <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>Remove</button>
          </div>
          <Field label="Question"><input style={inp} value={item.question || ''} onChange={(e) => upd(i, 'question', e.target.value)} /></Field>
          <Field label="Answer"><textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={item.answer || ''} onChange={(e) => upd(i, 'answer', e.target.value)} /></Field>
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add FAQ
      </button>
    </>
  );
};

const FooterEditor = ({ c, set }) => (
  <>
    <div style={{ display: 'flex', gap: 10 }}>
      <Field label="Phone Number" style={{ flex: 1 }}><input style={inp} value={tf(c,'phone')} onChange={(e) => set('phone', e.target.value)} /></Field>
      <Field label="Email Address" style={{ flex: 1 }}><input style={inp} value={tf(c,'email')} onChange={(e) => set('email', e.target.value)} /></Field>
    </div>
    <Divider />
    <Field label="Facebook URL"><input style={inp} value={tf(c,'facebookUrl')} onChange={(e) => set('facebookUrl', e.target.value)} /></Field>
    <Field label="Instagram URL"><input style={inp} value={tf(c,'instagramUrl')} onChange={(e) => set('instagramUrl', e.target.value)} /></Field>
    <Field label="Airbnb URL"><input style={inp} value={tf(c,'airbnbUrl')} onChange={(e) => set('airbnbUrl', e.target.value)} /></Field>
    <Divider />
    <Field label="Copyright Text (\n for line break)">
      <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={tf(c,'copyright')} onChange={(e) => set('copyright', e.target.value)} />
    </Field>
  </>
);

const PropertyRulesEditor = ({ c, set }) => {
  const cols = [
    { titleKey: 'col1Title', iconKey: 'col1Icon', rulesKey: 'col1Rules', label: 'Column 1' },
    { titleKey: 'col2Title', iconKey: 'col2Icon', rulesKey: 'col2Rules', label: 'Column 2' },
    { titleKey: 'col3Title', iconKey: 'col3Icon', rulesKey: 'col3Rules', label: 'Column 3' },
  ];
  return (
    <>
      <p style={{ fontSize: '0.78rem', color: '#8b8b8b', marginTop: 0, marginBottom: 16, lineHeight: 1.6 }}>
        These three columns appear on every property detail page under "Homys Rules". Edit the title, icon, and list of rules for each column.
      </p>
      {cols.map(({ titleKey, iconKey, rulesKey, label }) => {
        const rules = c?.[rulesKey] || [];
        const updRule = (i, val) => { const n = [...rules]; n[i] = val; set(rulesKey, n); };
        const addRule = () => set(rulesKey, [...rules, '']);
        const removeRule = (i) => set(rulesKey, rules.filter((_, idx) => idx !== i));
        return (
          <div key={rulesKey} style={{ background: '#f9f6f1', border: '1.5px solid #e8e0d4', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <p style={{ fontWeight: 800, fontSize: '0.8rem', color: '#112a3d', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <Field label="Icon (emoji)" style={{ width: 90, flexShrink: 0 }}>
                <input style={inp} value={c?.[iconKey] || ''} onChange={(e) => set(iconKey, e.target.value)} placeholder="🏠" />
              </Field>
              <Field label="Column Title" style={{ flex: 1 }}>
                <input style={inp} value={c?.[titleKey] || ''} onChange={(e) => set(titleKey, e.target.value)} />
              </Field>
            </div>
            <Label>Rules List</Label>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input style={{ ...inp, flex: 1 }} value={rule} onChange={(e) => updRule(i, e.target.value)} placeholder={`Rule ${i + 1}`} />
                <button onClick={() => removeRule(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0 }}><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={addRule} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#112a3d', marginTop: 4 }}>
              <Plus size={12} /> Add Rule
            </button>
          </div>
        );
      })}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// New section editors: Nav, Auth, Legal, 404
// ══════════════════════════════════════════════════════════════════════════

const GlobalNavEditor = ({ c, set }) => {
  const links = c?.links || [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/AboutUs' },
    { label: 'Stays', href: '/stays' },
    { label: 'Contact', href: '/contactus' },
  ];
  const upd = (i, key, val) => { const n = [...links]; n[i] = { ...n[i], [key]: val }; set('links', n); };
  const add = () => set('links', [...links, { label: '', href: '/' }]);
  const remove = (i) => set('links', links.filter((_, idx) => idx !== i));
  return (
    <>
      <ImageField label="Logo Image (leave empty to use default)" value={tf(c, 'logoUrl')} onChange={(v) => set('logoUrl', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Book Now Button Text">
          <input style={inp} value={tf(c, 'ctaText')} onChange={(e) => set('ctaText', e.target.value)} placeholder="Book Now" />
        </Field>
        <Field label="Book Now Button Link">
          <input style={inp} value={tf(c, 'ctaHref')} onChange={(e) => set('ctaHref', e.target.value)} placeholder="/booknow" />
        </Field>
      </div>
      <Divider />
      <Label>Navigation Links (in order)</Label>
      {links.map((l, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input style={{ ...inp, flex: 1 }} value={l.label} onChange={(e) => upd(i, 'label', e.target.value)} placeholder="Label" />
          <input style={{ ...inp, flex: 1 }} value={l.href} onChange={(e) => upd(i, 'href', e.target.value)} placeholder="/path" />
          <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: '1.5px dashed #c4a369', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#112a3d' }}>
        <Plus size={13} /> Add Link
      </button>
    </>
  );
};

const AuthLoginEditor = ({ c, set }) => (
  <>
    <Field label="Page Title"><input style={inp} value={tf(c, 'title')} onChange={(e) => set('title', e.target.value)} placeholder="Welcome" /></Field>
    <Field label="Subtitle"><input style={inp} value={tf(c, 'subtitle')} onChange={(e) => set('subtitle', e.target.value)} placeholder="Log in to your Homys account" /></Field>
    <ImageField label="Background Image (optional)" value={tf(c, 'backgroundImage')} onChange={(v) => set('backgroundImage', v)} />
  </>
);

const AuthSignupEditor = ({ c, set }) => (
  <>
    <Field label="Page Title"><input style={inp} value={tf(c, 'title')} onChange={(e) => set('title', e.target.value)} placeholder="Join Us" /></Field>
    <Field label="Subtitle"><input style={inp} value={tf(c, 'subtitle')} onChange={(e) => set('subtitle', e.target.value)} placeholder="Create your sanctuary account" /></Field>
    <ImageField label="Background Image (optional)" value={tf(c, 'backgroundImage')} onChange={(v) => set('backgroundImage', v)} />
  </>
);

const LegalEditor = ({ c, set, placeholder }) => (
  <>
    <Field label="Page Title"><input style={inp} value={tf(c, 'title')} onChange={(e) => set('title', e.target.value)} /></Field>
    <Field label="Last Updated Date"><input style={inp} value={tf(c, 'lastUpdated')} onChange={(e) => set('lastUpdated', e.target.value)} placeholder="e.g. January 2025" /></Field>
    <Field label="Content (Markdown supported — use ## for headings, **bold**, - for bullets)">
      <textarea
        style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6 }}
        rows={20}
        value={tf(c, 'body')}
        onChange={(e) => set('body', e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  </>
);

const NotFoundEditor = ({ c, set }) => (
  <>
    <Field label="Heading"><input style={inp} value={tf(c, 'heading')} onChange={(e) => set('heading', e.target.value)} placeholder="Page Not Found" /></Field>
    <Field label="Sub-text"><input style={inp} value={tf(c, 'subtext')} onChange={(e) => set('subtext', e.target.value)} placeholder="The page you're looking for doesn't exist." /></Field>
    <Field label="Button Label"><input style={inp} value={tf(c, 'buttonText')} onChange={(e) => set('buttonText', e.target.value)} placeholder="Back to Home" /></Field>
    <Field label="Button Link"><input style={inp} value={tf(c, 'buttonHref')} onChange={(e) => set('buttonHref', e.target.value)} placeholder="/" /></Field>
  </>
);

// ══════════════════════════════════════════════════════════════════════════
// Section registry
// ══════════════════════════════════════════════════════════════════════════
const SECTIONS = {
  home_hero:          { title: 'Hero Section',                  description: 'Full-screen background image at the top of the homepage',                          Editor: HomeHeroEditor },
  home_services:      { title: 'Services Section',              description: 'The three service cards below the hero (Hospitality, Maintenance, Experience)',      Editor: HomeServicesEditor },
  home_sea_section:   { title: 'Sea / Video Section',           description: 'The video-background section with the "hotel standards" headline',                  Editor: HomeSeaEditor },
  home_quiz:          { title: 'Quiz / Q&A Section',            description: '"Not sure where to start?" personalized guidance block',                            Editor: HomeQuizEditor },
  home_destinations:  { title: 'Destinations Section',          description: 'Your Next Stay grid — destination cards with images and property counts',            Editor: HomeDestinationsEditor },
  home_about:         { title: 'About Preview Section',         description: 'The split section with two photos and the Homys blurb on the homepage',             Editor: HomeAboutEditor },
  home_list_property: { title: 'List Your Property Section',    description: 'The CTA block for property owners with benefits list',                              Editor: HomeListPropertyEditor },
  home_faq:           { title: 'Homepage FAQs',                 description: 'The FAQ accordion at the bottom of the homepage',                                   Editor: FaqEditor },
  stays_hero:         { title: 'Stays Hero Image',              description: 'Hero image and filter pills shown at the top of the Stays page',                    Editor: StaysHeroEditor },
  stays_partners:     { title: 'Partners Section',              description: 'The upcoming partners / thumbnail grid shown on the Stays page',                    Editor: StaysPartnersEditor },
  about_hero:         { title: 'About — Hero',                  description: '"We believe home is more than a place" full-screen hero',                           Editor: AboutHeroEditor },
  about_mission:      { title: 'About — Mission',               description: 'Banner text + split image and body text',                                           Editor: AboutMissionEditor },
  about_stats:        { title: 'About — Statistics',            description: 'The four animated counters (destinations, guests, nights, return rate)',             Editor: AboutStatsEditor },
  about_why_choose:   { title: 'About — Why Choose Us',         description: 'The four feature cards (Security, Quality, Booking, Locations)',                   Editor: AboutWhyEditor },
  about_vision_mission: { title: 'About — Vision & Mission',    description: 'Two-card section: Our Vision and Our Mission',                                    Editor: AboutVisionMissionEditor },
  about_founders:     { title: 'About — Founders',              description: 'Founder profile cards with photos, roles, and bios',                               Editor: AboutFoundersEditor },
  about_timeline:     { title: 'About — Timeline',              description: 'The journey so far — year-by-year timeline',                                        Editor: AboutTimelineEditor },
  about_gallery:      { title: 'About — Style Gallery',         description: 'The mosaic photo gallery section',                                                  Editor: AboutGalleryEditor },
  about_testimonials: { title: 'About — Testimonials',          description: 'What our guests say — review quote cards',                                          Editor: AboutTestimonialsEditor },
  about_cta:          { title: 'About — Final CTA',             description: '"Ready to find your Homys?" call-to-action section',                               Editor: AboutCtaEditor },
  contact_page:       { title: 'Contact Page',                  description: 'Hero text, office address, phone, email, hours, and social links',                  Editor: ContactPageEditor },
  faq_page:           { title: 'Full FAQ Page',                 description: 'All FAQ items shown on the dedicated FAQ page',                                     Editor: FaqPageEditor },
  footer:                 { title: 'Footer',                        description: 'Phone, email, social links, and copyright text shown in the site footer',           Editor: FooterEditor },
  property_homys_rules:   { title: 'Homys Rules',                    description: 'Three-column rules block shown on every property detail page (Cancellation, Guest Regulations, House Rules)', Editor: PropertyRulesEditor },
  // ── New sections ──
  global_nav:       { title: 'Header & Navigation',   description: 'Logo, navigation links, and "Book Now" CTA button across the whole site',                    Editor: GlobalNavEditor },
  auth_login:       { title: 'Login Page',            description: 'Title, subtitle, and optional background image for the login screen',                         Editor: AuthLoginEditor },
  auth_signup:      { title: 'Sign Up Page',          description: 'Title and subtitle displayed on the account creation page',                                   Editor: AuthSignupEditor },
  legal_privacy:    { title: 'Privacy Policy',        description: 'Full Privacy Policy text (Markdown) shown on /privacy',                                       Editor: (props) => <LegalEditor {...props} placeholder="## Privacy Policy\n\nYour privacy matters to us…" /> },
  legal_terms:      { title: 'Terms of Service',      description: 'Full Terms of Service text (Markdown) shown on /terms',                                       Editor: (props) => <LegalEditor {...props} placeholder="## Terms of Service\n\nBy using Homys…" /> },
  global_404:       { title: '404 Page',              description: 'Heading, sub-text, and button for the "page not found" screen',                               Editor: NotFoundEditor },
};

const PAGES = [
  { key: 'home',       label: 'Home',       sections: ['home_hero','home_services','home_sea_section','home_quiz','home_destinations','home_about','home_list_property','home_faq'] },
  { key: 'stays',      label: 'Stays',      sections: ['stays_hero','stays_partners'] },
  { key: 'properties', label: 'Properties', sections: ['property_homys_rules'] },
  { key: 'about',      label: 'About Us',   sections: ['about_hero','about_mission','about_stats','about_why_choose','about_vision_mission','about_founders','about_timeline','about_gallery','about_testimonials','about_cta'] },
  { key: 'contact',    label: 'Contact',    sections: ['contact_page'] },
  { key: 'faq',        label: 'FAQ',        sections: ['faq_page'] },
  { key: 'global',     label: 'Global',     sections: ['footer','global_nav','global_404'] },
  { key: 'auth',       label: 'Auth',       sections: ['auth_login','auth_signup'] },
  { key: 'legal',      label: 'Legal',      sections: ['legal_privacy','legal_terms'] },
];

// ══════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════
const WebsiteContent = () => {
  const [activePage, setActivePage] = useState('home');
  const [data, setData]   = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved]   = useState({});
  const [loading, setLoading] = useState(true);
  const [globalMsg, setGlobalMsg] = useState('');

  useEffect(() => {
    contentAPI.getAll()
      .then((res) => {
        const map = {};
        (res.data.sections || []).forEach((s) => { map[s.section] = s.content; });
        setData(map);
      })
      .catch(() => setGlobalMsg('Failed to load content. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const setField = useCallback((sectionKey, fieldKey, value) => {
    setData((prev) => ({
      ...prev,
      [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value },
    }));
  }, []);

  const saveSection = useCallback(async (sectionKey) => {
    setSaving((p) => ({ ...p, [sectionKey]: true }));
    try {
      await adminAPI.updateContent(sectionKey, data[sectionKey] || {});
      invalidateCache(sectionKey);
      setSaved((p) => ({ ...p, [sectionKey]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [sectionKey]: false })), 3000);
    } catch (err) {
      alert(`Failed to save "${SECTIONS[sectionKey]?.title}": ${err.message}`);
    } finally {
      setSaving((p) => ({ ...p, [sectionKey]: false }));
    }
  }, [data]);

  const currentPage = PAGES.find((p) => p.key === activePage);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Globe size={22} color="#c4a369" />
        <h2 style={{ color: '#112a3d', fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>Website Content</h2>
      </div>
      <p style={{ color: '#8b8b8b', fontSize: '0.85rem', marginBottom: 28 }}>
        Edit every section of every page — text, images, buttons, lists. Changes are saved directly to the live site.
      </p>

      {globalMsg && <div style={{ background: '#fde8e8', borderRadius: 10, padding: '12px 16px', color: '#c62828', fontWeight: 600, marginBottom: 20 }}>{globalMsg}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
          <RefreshCw size={30} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Loading site content…</p>
        </div>
      ) : (
        <>
          <PageTab pages={PAGES} active={activePage} onChange={setActivePage} />

          {currentPage?.sections.map((sectionKey) => {
            const meta = SECTIONS[sectionKey];
            if (!meta) return null;
            const { Editor } = meta;
            const content = data[sectionKey] || {};
            const setF = (k, v) => setField(sectionKey, k, v);
            return (
              <SectionCard
                key={sectionKey}
                title={meta.title}
                description={meta.description}
                saving={!!saving[sectionKey]}
                saved={!!saved[sectionKey]}
                onSave={() => saveSection(sectionKey)}
              >
                <Editor c={content} set={setF} />
              </SectionCard>
            );
          })}
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default WebsiteContent;
