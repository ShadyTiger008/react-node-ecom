import React from 'react';
import './DescriptionBox.css';

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>Explore our latest clothing collection, designed to elevate your style and comfort. Discover trendy outfits crafted from premium fabrics, offering a perfect blend of fashion and functionality.</p>
        <p>From casual wear to formal attire, our clothing line caters to every occasion. Find a wide range of options including shirts, dresses, pants, jackets, and accessories, all meticulously designed to reflect modern trends.</p>
      </div>
    </div>
  );
}

export default DescriptionBox;
