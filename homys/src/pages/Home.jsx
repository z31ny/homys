import React from 'react';
import './Home.css';
import Hero from './../components/Hero';
import HeroBody from '../components/HeroBody';
import NextStay from '../components/NextStay';
import AboutHero from '../components/AboutHero';
import Separator from '../common/Separator';
import FaqHero from '../components/FaqHero';
import SeaSection from '../components/SeaSection';

const Home = () => {
  return (
    <>
      <Hero />
      <HeroBody />
      <SeaSection />
      <NextStay />
      <AboutHero />
      <Separator />
      <FaqHero />
    </>
  );
};

export default Home;