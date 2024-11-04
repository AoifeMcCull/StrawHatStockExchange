//TODO: react prop pass with pirate id
//TODO: pirate images
import './PirateCard.css'
import BerryIcon from '../BerryIcon';
function PirateCard(props){

    return(
        <div className='pirateCardDiv'>
            <img src='/luffy.png'></img>
            <div className='pirateCardTextContainer'>
                <h2 className='pirateName'>{props.name}</h2>
                <h3 className='priceDisplay'>
                <img className='berrySymbol' width="12" alt="Berrysymbol" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Berrysymbol.svg/256px-Berrysymbol.svg.png?20220414003424" />
                    {props.price}
                </h3>
                
            </div>
            <p className='crewName'>{props.crew}</p>
        </div>
    )
}

export default PirateCard;