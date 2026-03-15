import React from 'react';
import './Stays.css';
import FaqHero from '../components/FaqHero';
import StaysHero from './../components/StaysHero';
import Homes from './../components/Homes';
import Partners from './../components/Partners';
import framehomes from '../imgs/framehomes.png';

const Stays = () => {
    return ( 
       <>
        <StaysHero/>
        <Homes/>
        <Partners/>
        {/* Style added to ensure it covers the full width and removes any bottom spacing */}
        <img 
            src={framehomes} 
            alt="Featured" 
            style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
        <FaqHero/>
        </>
    );
}
 
export default Stays;