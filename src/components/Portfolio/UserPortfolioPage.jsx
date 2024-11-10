import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PirateCard from '../PirateCard/PirateCard';
import './UserPortfolioPage.css'
import PirateModal from '../PirateModal/PirateModal';
const UserPortfolioPage = () => {
  const { userid } = useParams(); // Get the user ID from the URL
  const [pirates, setPirates] = useState([]); // State to store the fetched pirates
  const [selectedPirate, setSelectedPirate] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = (pirate) => {
    (setSelectedPirate(pirate));
    setModalOpen(true);
} 

const closeModal = () => {
    setModalOpen(false);
    setSelectedPirate(null);
}


  // Fetch the user's portfolio when the component mounts or when userid changes
  useEffect(() => {
    const fetchUserPortfolio = async () => {
      try {
        const response = await axios.get(`/api/pirates/portfolio/${userid}/pirates`);
        setPirates(response.data); // Set the pirates data to state\
      } catch (error) {
        console.error('Error fetching user portfolio:', error);
      }
    };

    fetchUserPortfolio();
  }, [userid]); // Dependency array ensures this runs whenever the userid changes

  return (
    <div className="container">
      <h1>Portfolio</h1>
      <div className="pirateGrid">
        {/* Map through the pirates array and display PirateModal for each pirate */}
        {console.log(pirates)}
        {pirates.length === 0 || pirates.every(pirate => pirate.amount <= 0) ? (
            <p>No pirates available to display.</p>  // Display a message if there are no pirates
            ) : (
            pirates.map((pirate) => (
                pirate.amount > 0 && (
                <div key={pirate.inventoryitemid} className="pirate-card">
                <PirateCard
                    id={pirate.pirateid}
                    name={pirate.piratename}
                    amount={pirate.amount}
                    price={pirate.price}
                    crew={pirate.crewname}
                    onClick={() => openModal(pirate)}
                />
            </div>))
            )
        )
        }
      </div>
      <PirateModal
        isOpen={isModalOpen}
        pirate={selectedPirate}
        onClose={closeModal}
        />
    </div>
  );
};

export default UserPortfolioPage;