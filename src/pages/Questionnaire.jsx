import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireAPI } from '../services/api';
import './Questionnaire.css';

import frame125 from '../imgs/Frame 125.png';
import frame130 from '../imgs/Frame 130.png';
import rect10 from '../imgs/Rectangle 10.png';
import rect11 from '../imgs/Rectangle 11.png';
import rect6 from '../imgs/Rectangle 6.png';
import reccc from '../imgs/recc.png';
import group14 from '../imgs/Group 14.png';

const fallbackImg = frame125;

const Questionnaire = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matchedProperties, setMatchedProperties] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    purpose: '',
    guests: 2,
    rooms: '',
    budget: '',
    duration: '',
    view: '',
    amenities: []
  });

  const totalSteps = 9;

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (step < totalSteps) {
      setTimeout(() => setStep(step + 1), 400);
    }
  };

  const handleMultiSelect = (item) => {
    const current = formData.amenities;
    if (item === "Nothing specific") {
      setFormData({ ...formData, amenities: ["Nothing specific"] });
      return;
    }
    const filtered = current.filter(i => i !== "Nothing specific");
    const updated = filtered.includes(item) ? filtered.filter(i => i !== item) : [...filtered, item];
    setFormData({ ...formData, amenities: updated });
  };

  const startSyncing = async () => {
    setIsLoading(true);
    try {
      const res = await questionnaireAPI.submit({
        locationPref: formData.location || undefined,
        purpose: formData.purpose || undefined,
        guests: formData.guests,
        roomsPref: formData.rooms?.toString() || undefined,
        budgetRange: formData.budget || undefined,
        durationPref: formData.duration || undefined,
        viewPref: formData.view || undefined,
        amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      });
      setMatchedProperties(res.data.matches || []);
    } catch (err) {
      console.error('Questionnaire error:', err);
      setMatchedProperties([]);
    } finally {
      setIsLoading(false);
      setShowResults(true);
    }
  };

  if (isLoading) {
    return (
      <div className="quiz-sync-loader">
        <div className="sync-box">
          <div className="pulse-ring"></div>
          <h2 className="libre">Syncing Data...</h2>
          <p className="encode">Finding the best sanctuaries for your profile</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="results-page">
        <h1 className="libre">Your Top Matches</h1>
        {matchedProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="encode" style={{ fontSize: '1.1rem', opacity: 0.7, marginBottom: '30px' }}>
              No exact matches found for your preferences yet. As we grow our collection, your perfect sanctuary will appear!
            </p>
            <div className="res-actions">
              <button className="cta-dark encode" onClick={() => navigate('/stays')}>Explore All Stays</button>
              <button className="cta-light encode" onClick={() => {setShowResults(false); setStep(1); setMatchedProperties([]); }}>Start Over</button>
            </div>
          </div>
        ) : (
          <>
            <div className="results-grid">
              {matchedProperties.map(item => (
                <div key={item.id} className="res-card" onClick={() => navigate(`/stays/${item.id}`)}>
                  <div className="res-img">
                    <img
                      src={item.heroImageUrl || fallbackImg}
                      alt={item.title}
                      onError={(e) => { e.target.src = fallbackImg; }}
                    />
                  </div>
                  <div className="res-info">
                    <h3 className="libre">{item.title}</h3>
                    <p className="encode">{item.locationName}</p>
                    <div className="encode" style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
                      {item.bedrooms && <span>{item.bedrooms} Bed{item.bedrooms !== 1 ? 's' : ''}</span>}
                      {item.propertyType && <span>{item.propertyType}</span>}
                      {item.viewType && <span>{item.viewType} view</span>}
                    </div>
                    <span className="price">${item.pricePerNight}/night</span>
                    <button className="view-btn encode">View Details</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="res-actions">
              <button className="cta-dark encode" onClick={() => navigate('/stays')}>Explore All Stays</button>
              <button className="cta-light encode" onClick={() => {setShowResults(false); setStep(1); setMatchedProperties([]); }}>Start Over</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-nav">
        <button className="exit-btn" onClick={() => navigate('/')}>← EXIT</button>
        <div className="bar-bg"><div className="bar-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div></div>
      </div>

      <div className="quiz-center-content">
        {step === 1 && (
          <div className="q-step animate-in">
            <h1 className="libre">Where should we look?</h1>
            <div className="visual-grid">
              {[{ id: 'Sahel', img: rect6 }, { id: 'Cairo', img: frame130 }, { id: 'Gouna', img: rect11 }, { id: 'Red Sea', img: reccc }].map(loc => (
                <div key={loc.id} className={`v-card ${formData.location === loc.id ? 'active' : ''}`} onClick={() => handleSelect('location', loc.id)}>
                  <img src={loc.img} alt={loc.id} /><div className="v-overlay"><h3 className="encode">{loc.id}</h3></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="q-step animate-in">
            <h1 className="libre">Purpose of stay?</h1>
            <div className="pills-grid">
              {['Relaxation', 'Work Trip', 'Family Vacation', 'Honey Moon'].map(p => (
                <button key={p} className={`pill ${formData.purpose === p ? 'active' : ''}`} onClick={() => handleSelect('purpose', p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="q-step animate-in">
            <h1 className="libre">How many guests?</h1>
            <div className="counter-ui">
              <button onClick={() => setFormData({...formData, guests: Math.max(1, formData.guests - 1)})}>-</button>
              <span className="libre">{formData.guests}</span>
              <button onClick={() => setFormData({...formData, guests: formData.guests + 1})}>+</button>
            </div>
            <button className="next-btn-rect encode" onClick={() => setStep(4)}>CONTINUE</button>
          </div>
        )}

        {step === 4 && (
          <div className="q-step animate-in">
            <h1 className="libre">Bedrooms required?</h1>
            <div className="pills-grid">
              {[1, 2, 3, '4+'].map(r => (
                <button key={r} className={`pill ${formData.rooms === r ? 'active' : ''}`} onClick={() => handleSelect('rooms', r)}>{r} Bedroom{r !== 1 && 's'}</button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="q-step animate-in">
            <h1 className="libre">Nightly Budget?</h1>
            <div className="pills-grid">
              {[{ id: 'Eco', d: 'Under $150' }, { id: 'Mid', d: '$150 - $400' }, { id: 'Lux', d: '$400 - $800' }, { id: 'Elite', d: '$1500+' }].map(b => (
                <button key={b.id} className={`pill stack ${formData.budget === b.id ? 'active' : ''}`} onClick={() => handleSelect('budget', b.id)}>
                  <span className="l">{b.id}</span><span className="s">{b.d}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="q-step animate-in">
            <h1 className="libre">Stay Duration?</h1>
            <div className="pills-grid">
              {[{ id: 'Short', d: '1-3 Nights' }, { id: 'Week', d: '4-7 Nights' }, { id: 'Extended', d: '2 Weeks+' }, { id: 'Long', d: '1 Month+' }].map(d => (
                <button key={d.id} className={`pill stack ${formData.duration === d.id ? 'active' : ''}`} onClick={() => handleSelect('duration', d.id)}>
                  <span className="l">{d.id}</span><span className="s">{d.d}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="q-step animate-in">
            <h1 className="libre">Preferred View?</h1>
            <div className="visual-grid">
              {[{ id: 'Sea', img: group14 }, { id: 'Pool', img: rect10 }, { id: 'Garden', img: rect6 }, { id: 'City', img: frame130 }].map(v => (
                <div key={v.id} className={`v-card ${formData.view === v.id ? 'active' : ''}`} onClick={() => handleSelect('view', v.id)}>
                  <img src={v.img} alt={v.id} /><div className="v-overlay"><h3 className="encode">{v.id} Front</h3></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="q-step animate-in">
            <h1 className="libre">Essential amenities?</h1>
            <div className="multi-flex">
              {['Private Pool', 'Gym', 'Smart Home', 'Chef', 'Fiber Wifi', 'Spa', 'Nothing specific'].map(item => (
                <button key={item} className={`pill-multi ${formData.amenities.includes(item) ? 'active' : ''}`} onClick={() => handleMultiSelect(item)}>{item}</button>
              ))}
            </div>
            <button className="next-btn-rect encode" onClick={() => setStep(9)}>NEXT STEP</button>
          </div>
        )}

        {step === 9 && (
          <div className="q-step animate-in">
            <h1 className="libre">Ready for Results?</h1>
            <button className="next-btn-rect encode finish" onClick={startSyncing}>FIND MY SANCTUARY</button>
          </div>
        )}

        {step > 1 && <button className="prev-txt encode" onClick={() => setStep(step - 1)}>← ADJUST PREVIOUS ANSWER</button>}
      </div>
    </div>
  );
};

export default Questionnaire;