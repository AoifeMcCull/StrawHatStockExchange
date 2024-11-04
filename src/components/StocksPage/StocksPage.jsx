import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import PirateCard from '../PirateCard/PirateCard.jsx'
import PirateModal from '../PirateModal/PirateModal.jsx';
import './StocksPage.css'


function StocksPage() {
    const [pirateRows, setPirateRows] = useState([])
    const [loading, setLoading] = useState(true);
    const [selectedPirate, setSelectedPirate] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchPirateRows()
    }, [])

    const fetchPirateRows = async () => {
        try {
            const pirateRowResponse = await axios.get('/api/pirates/pirateCards');
            setPirateRows(pirateRowResponse.data);
            setLoading(false);
        } catch (err) {
            console.log('error fetching pirate rows:', err)
        }
    }

    const openModal = (pirate) => {
        (setSelectedPirate(pirate));
        setModalOpen(true);
    } 

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPirate(null);
    }

  if(loading) {
    return(<div>Loading,,,</div>)
  }

  return (
    <div className="container">
      <div className = "pirateGrid">
        {console.log(pirateRows)}
        {pirateRows.map((pirateRow) => (
            //<li> {pirateRow.pirateid}, {pirateRow.piratename}, {pirateRow.price}</li>
            <PirateCard 
                key={pirateRow.pirateid}
                id={pirateRow.pirateid}
                name={pirateRow.piratename}
                price={pirateRow.price}
                crew={pirateRow.crewname}
                onClick={() => openModal(pirateRow)}/>
        ))}
      </div>

      <PirateModal
        isOpen={isModalOpen}
        pirate={selectedPirate}
        onClose={closeModal}
        />
    </div>
  );
}

export default StocksPage;
