import React, { useState } from 'react';
import FaqHero from '../components/FaqHero';
import StaysHero from './../components/StaysHero';
import Homes from './../components/Homes';
import Partners from './../components/Partners';
import framehomes from '../imgs/framehomes.png';

const Stays = () => {
  const [activeLocation, setActiveLocation] = useState('All');
  const [filterOpen, setFilterOpen]         = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  });

  // Merge pill location + advanced filters into a single object for Homes
  const activeFilters = {
    location: activeLocation === 'All' ? '' : activeLocation,
    ...advancedFilters,
  };

  return (
    <>
      <StaysHero
        activeLocation={activeLocation}
        setActiveLocation={setActiveLocation}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
      />
      <Homes filters={activeFilters} />
      <Partners />
      <img
        src={framehomes}
        alt="Featured"
        style={{ width: '100%', height: 'auto', display: 'block', marginTop: '20px' }}
      />
      <FaqHero />
    </>
  );
};

export default Stays;
