import React, { useEffect } from 'react';
import './Home.css';
import Hero from './../components/Hero';
import FeaturedUnits from '../components/FeaturedUnits';
import NextStay from '../components/NextStay';
import AboutHero from '../components/AboutHero';
import Separator from '../common/Separator';
import FaqHero from '../components/FaqHero';
import SeaSection from '../components/SeaSection';
import QandA from '../components/QandA';
import AddPropertyComp from '../components/AddPropertyComp';

const Home = () => {
  useEffect(() => {
    // Clear any stale payment/checkout state so it never bleeds into the home page
    localStorage.removeItem('homys_payment_state');
    sessionStorage.removeItem('homys_checkout_data');
  }, []);

  return (
    <>
      <Hero />
      <FeaturedUnits />
      <SeaSection />
      <QandA/>
      <NextStay />
      <AboutHero />
      <AddPropertyComp/>
      <Separator />
      <FaqHero />
    </>
  );
};

export default Home;