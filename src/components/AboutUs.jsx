import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../useCMS';
import { staticUrl, responsiveProps } from '../staticAssets';
import './AboutUs.css';

const missionImg = staticUrl('Group_14.png');
const reccc = staticUrl('recc.png');
import team1 from '../imgs/Rectangle 6.png';
import team2 from '../imgs/Rectangle 9.png';
import team3 from '../imgs/Rectangle 10.png';
import team4 from '../imgs/Rectangle 11.png';

const FALLBACK_TEAM    = [team1, team2, team3, team4];
const FALLBACK_GALLERY = [team4, missionImg, team2, reccc];

// Animated counter
const Counter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const endVal = parseInt(String(end).replace(/,/g, '')) || 0;
    if (!endVal) return;
    const timer = setInterval(() => {
      start += Math.ceil(endVal / 50);
      if (start >= endVal) { setCount(endVal); clearInterval(timer); }
      else setCount(start);
    }, 40);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// CMS defaults — field names match the admin editor exactly
const D_HERO  = { title: "We believe\nhome is more\nthan a place.", highlightWord: 'home', subtitle: 'Homys was founded on the idea that luxury and comfort should be accessible to everyone who seeks a sanctuary by the sea or in the heart of the city.' };
const D_MISS  = { bannerText: "Homys was born from a desire to redefine the concept of home.", splitImage: missionImg, splitTitle: 'Finding the soul in modern living.', splitBody: "Every property we manage is hand-picked for its unique character. We don't just provide rooms; we provide the backdrop for your most cherished memories." };
const D_STATS = { stats: [{ value: '12', suffix: '+', label: 'Destinations' }, { value: '5000', suffix: '+', label: 'Happy Guests' }, { value: '30000', suffix: '+', label: 'Nights Booked' }, { value: '88', suffix: '%', label: 'Return Rate' }] };
const D_WHY   = { title: 'Why Choose Homys?', cards: [{ title: 'Trusted Security', body: 'We prioritize your safety with state-of-the-art security systems and 24/7 on-site presence.' }, { title: 'Verified Quality', body: 'Every home undergoes a 100-point inspection to meet our elite hospitality standards.' }, { title: 'Effortless Booking', body: 'Simple, transparent, and fast booking process with instant confirmation and flexible dates.' }, { title: 'Prime Locations', body: 'Strategically located properties that put you at the heart of the most vibrant communities.' }] };
const D_VM    = { title: 'Vision & Mission', visionTitle: 'Our Vision', visionBody: 'To become the leading premium short-stay platform across Egypt — redefining what it means to feel at home, anywhere.', missionTitle: 'Our Mission', missionBody: 'To hand-pick, manage, and deliver hotel-grade vacation homes that consistently exceed expectations — blending local character with world-class hospitality.' };
const D_FOUND = { title: 'Our Founders', founders: [{ name: 'Mohamed Magdy', role: 'Co-Founder & CEO', bio: 'A visionary leader with over a decade of experience in real estate and hospitality.', image: '' }, { name: 'Korashy', role: 'Co-Founder & COO', bio: 'Ensuring every Homys property operates with the highest level of care and precision.', image: '' }] };
const D_TIME  = { title: 'The Journey So Far', events: [{ year: '2021', text: 'Homys officially launched with 3 coastal properties.' }, { year: '2022', text: 'Expanded into city sanctuaries in the heart of Cairo.' }, { year: '2023', text: "Voted 'Best Emerging Hospitality Brand' in the region." }, { year: '2024', text: 'Reached our 50th property milestone across Egypt.' }] };
const D_GAL   = { title: 'The Newest Style for Your Home', subtitle: 'Blending coastal aesthetics with modern luxury to create spaces that feel both exotic and familiar.', images: ['', '', '', ''] };
const D_TEST  = { title: 'What Our Guests Say', testimonials: [{ quote: 'The attention to detail in every Homys home is unmatched. It truly felt like a home away from home.', name: 'Sarah J.', origin: 'Guest from UK' }, { quote: 'Clean, safe, and beautifully designed. The booking process was seamless.', name: 'Ahmed M.', origin: 'Guest from Cairo' }, { quote: 'Homys has redefined what coastal stays should be. Stunning properties.', name: 'Elena R.', origin: 'Guest from Italy' }] };
const D_CTA   = { title: 'Ready to find your Homys?', subtitle: 'Join our community and discover a new way of staying.', primaryButtonText: 'Get Started', secondaryButtonText: 'Stays' };

const AboutUs = () => {
  const navigate = useNavigate();
  const hero    = useCMS('about_hero',         D_HERO);
  const mission = useCMS('about_mission',      D_MISS);
  const statsD  = useCMS('about_stats',        D_STATS);
  const whyD    = useCMS('about_why_choose',   D_WHY);
  const vmD     = useCMS('about_vision_mission', D_VM);
  const foundD  = useCMS('about_founders',     D_FOUND);
  const timeD   = useCMS('about_timeline',     D_TIME);
  const galD    = useCMS('about_gallery',      D_GAL);
  const testD   = useCMS('about_testimonials', D_TEST);
  const ctaD    = useCMS('about_cta',          D_CTA);

  const stats       = statsD.stats?.length        ? statsD.stats        : D_STATS.stats;
  const cards       = whyD.cards?.length          ? whyD.cards          : D_WHY.cards;
  const founders    = foundD.founders?.length     ? foundD.founders     : D_FOUND.founders;
  const timeline    = timeD.events?.length        ? timeD.events        : D_TIME.events;
  const gallery     = galD.images?.length         ? galD.images         : D_GAL.images;
  const testimonials = testD.testimonials?.length ? testD.testimonials  : D_TEST.testimonials;

  const renderHeadline = (text, word) => {
    if (!word || !text?.includes(word)) return <span style={{ whiteSpace: 'pre-line' }}>{text}</span>;
    const parts = text.split(word);
    return (
      <span style={{ whiteSpace: 'pre-line' }}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && <span className="highlight">{word}</span>}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="about-us-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-text">
          <h1 className="libre">{renderHeadline(hero.title, hero.highlightWord)}</h1>
          <p className="encode">{hero.subtitle}</p>
        </div>
      </section>

      {/* Mission banner */}
      <section className="about-mission-banner">
        <div className="mission-content">
          <h2 className="libre">{mission.bannerText}</h2>
        </div>
      </section>

      {/* Split */}
      <section className="about-split">
        <div className="split-img">
          <img {...responsiveProps(mission.splitImage || missionImg, '(max-width: 768px) 100vw, 600px')} alt="Mission" loading="lazy" decoding="async" />
        </div>
        <div className="split-text">
          <h3 className="libre">{mission.splitTitle}</h3>
          <p className="encode">{mission.splitBody}</p>
        </div>
      </section>

      {/* Why Choose */}
      <section className="why-choose-section">
        <h2 className="libre section-title">{whyD.title}</h2>
        <div className="why-grid">
          {cards.map((card, i) => (
            <div key={i} className="why-card">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <h5 className="encode">{card.title}</h5>
              <p className="encode">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission-section">
        <h2 className="libre section-title">{vmD.title}</h2>
        <div className="vm-grid">
          <div className="vm-card">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <h3 className="libre">{vmD.visionTitle}</h3>
            <p className="encode">{vmD.visionBody}</p>
          </div>
          <div className="vm-card">
            <div className="vm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="libre">{vmD.missionTitle}</h3>
            <p className="encode">{vmD.missionBody}</p>
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="founders-section">
        <h2 className="libre section-title">{foundD.title}</h2>
        <div className="founders-grid">
          {founders.map((f, i) => (
            <div key={i} className="founder-card">
              <div className="founder-img">
                <img {...responsiveProps(f.image || FALLBACK_TEAM[i] || team1, '(max-width: 768px) 100vw, 400px')} alt={f.name} loading="lazy" decoding="async" />
              </div>
              <div className="founder-info">
                <h4 className="libre">{f.name}</h4>
                <span className="encode">{f.role}</span>
                <p className="encode">{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="style-gallery-section">
        <div className="style-gallery-header">
          <h2 className="libre">{galD.title}</h2>
          <div className="separator-line"></div>
          <p className="encode subtext">{galD.subtitle}</p>
        </div>

        {/* Desktop: mosaic grid */}
        <div className="mosaic-container">
          <div className="mosaic-top-grid">
            <div className="mosaic-item tall">
              <img {...responsiveProps(gallery[0] || FALLBACK_GALLERY[0], '50vw')} alt="Gallery 1" loading="lazy" decoding="async" />
            </div>
            <div className="mosaic-right-column">
              <div className="mosaic-item small"><img {...responsiveProps(gallery[1] || FALLBACK_GALLERY[1], '25vw')} alt="Gallery 2" loading="lazy" decoding="async" /></div>
              <div className="mosaic-item small"><img {...responsiveProps(gallery[2] || FALLBACK_GALLERY[2], '25vw')} alt="Gallery 3" loading="lazy" decoding="async" /></div>
            </div>
          </div>
          <div className="mosaic-item wide">
            <img {...responsiveProps(gallery[3] || FALLBACK_GALLERY[3], '100vw')} alt="Gallery 4" loading="lazy" decoding="async" />
          </div>
        </div>

        {/* Mobile: flat same-size carousel */}
        <div className="gallery-mobile-carousel">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="gallery-mobile-slide">
              <img {...responsiveProps(gallery[i] || FALLBACK_GALLERY[i], '80vw')} alt={`Gallery ${i + 1}`} loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="libre section-title">{testD.title}</h2>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="encode">"{t.quote}"</p>
              <div className="guest-info">
                <h6 className="libre">{t.name}</h6>
                <span className="encode">{t.origin}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2 className="libre">{ctaD.title}</h2>
        <p className="encode">{ctaD.subtitle}</p>
        <div className="cta-btns">
          <button className="cta-dark encode"  onClick={() => navigate('/questionnaire')}>{ctaD.primaryButtonText}</button>
          <button className="cta-light encode" onClick={() => navigate('/stays')}>{ctaD.secondaryButtonText}</button>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;
