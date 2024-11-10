import React from 'react';
import './AboutPage.css';
// This is one of our simplest components
// It doesn't have local state,
// It doesn't dispatch any redux actions or display any part of redux state
// or even care what the redux state is'

function AboutPage() {
  return (
    <div className="container">
      <div className="aboutPageText">
        <p className="aboutPageP">Straw Hat Stock Exchange is a fantasy stock exchange based on speculating on and trading pirates from the media franchise One Piece. Users can place orders to buy or sell a pirate, in order to collect their favorites, compete on the leaderboards, or try to amass the highest balance by buying low and selling high.</p>
      </div>
      <img className = "aboutImage" src='/public/PirateImages/5.png'></img>
      <div>
        <p className='aboutPageZoro'>Zoro's here because he got lost.</p>
      </div>
    </div>
  );
}

export default AboutPage;
