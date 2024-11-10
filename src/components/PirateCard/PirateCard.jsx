import './PirateCard.css'
import PirateModal from '../PirateModal/PirateModal';
function PirateCard(props){
    const imageUrl = `/PirateImages/${props.id}.png`;
    return(
        <div className='pirateCardDiv' onClick={() => props.onClick()}>
            <img src={imageUrl} className = 'pirateImage'></img>
            <div className='pirateCardTextContainer'>
                <h2 className='pirateName'>{props.name}</h2>
                <h3 className='priceDisplay'>
                <img className='berrySymbol' width="12" alt="Berrysymbol" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Berrysymbol.svg/256px-Berrysymbol.svg.png?20220414003424" />
                    {props.price}
                </h3>
                
                
            </div>
            <p className='crewName'>{props.crew}</p>
            {props.amount ? <p className="amount">Amount: {props.amount}</p> : <p></p>}
        </div>
    )
}

export default PirateCard;