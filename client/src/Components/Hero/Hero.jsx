import React from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_image from '../Assets/heroimg.png';

const Hero = () => {
  return (
    <div className='hero'>
      <div className="hero-left">
        <h2>DISCOVER NEW COLLECTIONS</h2> 
        <div>
            <div className="hero-hand-icon">
                <p>Trending</p> 
                <img src={hand_icon} alt="" />
            </div>
            <p>handpicked designs</p>
            <p>for everyone</p> {/* Updated text */}
        </div>
        <div className="hero-latest-btn">
            <div>Explore Now</div> 
            <img src={arrow_icon} alt="" />
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="" />
      </div>
    </div>
  );
}

export default Hero;
