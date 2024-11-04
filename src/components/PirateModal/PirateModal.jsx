import React, {useState} from "react";
import './PirateModal.css';

const PirateModal = ({ isOpen, pirate, onClose }) => {

    const imageUrl = pirate? `/PirateImages/${pirate.pirateid}.png` : null

    if (!isOpen) return null;
    console.log('opened Modal!', pirate, isOpen)
    return (
        
        <div className="pirateModal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>{pirate.piratename}</h2>
                <p>Price: {pirate.price}</p>
                <p>Crew: {pirate.crewname}</p>
                <img src={imageUrl} alt={pirate.name} /> {/* Example of additional content */}
            </div>
        </div>
    );
}

export default PirateModal;