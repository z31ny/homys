import React from 'react';
import separatorImg from '../imgs/separator.png';

const Separator = () => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
      <img src={separatorImg} alt="separator" style={{ width: '100%', maxWidth: '1200px', height: 'auto' }} />
    </div>
  );
};

export default Separator;