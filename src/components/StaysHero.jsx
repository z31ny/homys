import React, { useState, useEffect } from 'react';
import { useCMS } from '../useCMS';
import './StaysHero.css';
import { staticUrl } from '../staticAssets';
import separator2 from '../imgs/separator2.png';
const StaysHeroImg = staticUrl('StaysHero.png', 'f_auto,q_auto,w_1920');
import star from '../imgs/star.png';

const DEFAULTS = {
  backgroundImage: StaysHeroImg,
  filterPills: ['All', 'Fouka Bay', 'Almaza Bay', 'Mountain View'],
};

const StaysHero = ({
  activeLocation,
  setActiveLocation,
  filterOpen,
  setFilterOpen,
  advancedFilters,
  setAdvancedFilters,
}) => {
  const c = useCMS('stays_hero', DEFAULTS);
  const pills = c.filterPills?.length ? c.filterPills : DEFAULTS.filterPills;

  // Local draft — only committed when user clicks Apply
  const [draft, setDraft] = useState(advancedFilters);

  // Keep draft in sync if parent resets filters externally
  useEffect(() => { setDraft(advancedFilters); }, [advancedFilters]);

  const handleApply = () => {
    setAdvancedFilters(draft);
    setFilterOpen(false);
  };

  const handleClear = () => {
    const empty = { propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' };
    setDraft(empty);
    setAdvancedFilters(empty);
    setFilterOpen(false);
  };

  const hasActiveFilters = Object.values(advancedFilters).some((v) => v !== '');

  return (
    <section className="stays-hero-section">
      <div className="stays-separator">
        <img src={separator2} alt="separator" />
      </div>

      {/* ── Filter bar ── */}
      <div className="filter-bar">
        <div className="filter-group-left">
          {pills.map((pill, i) => (
            <React.Fragment key={i}>
              <button
                className={`filter-pill ${activeLocation === pill ? 'active' : ''}`}
                onClick={() => setActiveLocation(pill)}
              >
                {pill}
              </button>
              {i === 0 && <img src={star} alt="star" className="star-icon" />}
            </React.Fragment>
          ))}
        </div>
        <div className="filter-group-right">
          <img src={star} alt="star" className="star-icon" />
          <button
            className={`filter-pill filter-btn ${filterOpen || hasActiveFilters ? 'active' : ''}`}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filter
            {hasActiveFilters && <span className="filter-dot" />}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 21v-7m0-4V3m8 18v-11m0-4V3m8 18v-3m0-4V3M1 14h6m2-6h6m2 10h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Advanced filter panel ── */}
      <div className={`advanced-filter-panel ${filterOpen ? 'open' : ''}`}>
        <div className="afp-inner">
          <div className="afp-grid">
            <div className="afp-field">
              <label>Property Type</label>
              <select
                value={draft.propertyType}
                onChange={(e) => setDraft({ ...draft, propertyType: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="chalet">Chalet</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div className="afp-field">
              <label>Min Price (EGP / night)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={draft.minPrice}
                onChange={(e) => setDraft({ ...draft, minPrice: e.target.value })}
              />
            </div>
            <div className="afp-field">
              <label>Max Price (EGP / night)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={draft.maxPrice}
                onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value })}
              />
            </div>
            <div className="afp-field">
              <label>Bedrooms</label>
              <select
                value={draft.bedrooms}
                onChange={(e) => setDraft({ ...draft, bedrooms: e.target.value })}
              >
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>
          </div>
          <div className="afp-actions">
            <button className="afp-clear" onClick={handleClear}>Clear All</button>
            <button className="afp-apply" onClick={handleApply}>Apply Filters</button>
          </div>
        </div>
      </div>

      <div className="hero-image-container">
        <img src={c.backgroundImage || StaysHeroImg} alt="Stays Hero" className="hero-main-img" />
      </div>
    </section>
  );
};

export default StaysHero;
