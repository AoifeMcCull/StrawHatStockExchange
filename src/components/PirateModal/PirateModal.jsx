import React, {useEffect, useState} from "react";
import './PirateModal.css';
import { useDispatch, useSelector } from "react-redux";
import PirateChart from '../PirateChart/PirateChart'
import axios from "axios";

const PirateModal = ({ isOpen, pirate, onClose }) => {
    const dispatch = useDispatch();
    const imageUrl = pirate? `/PirateImages/${pirate.pirateid}.png` : null
    const [amount, setAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [price, setPrice] = useState(0);
    const [chartData, setChartData] = useState([]);
    const user = useSelector((store) => store.user);
    


    const fetchChartData = () => {
        axios.post(`/api/transactions/piratehistory/`, {pirateid: pirate.pirateid})
        .then(response => {
            setChartData(response.data);
        })
        .catch(err => {
            console.log('error getting chart data!', err)
        })
    }
    
    useEffect(() => {
        if(isOpen && pirate){
            fetchChartData();
        }
        
    }, [isOpen, pirate]);

    const handleAmountChange= (event) => {
        const value = event.target.value;
        if(!isNaN(value) && value >= 0){
            setAmount(value);
            setErrorMessage(null);
        } else { setErrorMessage('Please enter a positive whole number amount')};
    }

    const handlePriceChange= (event) => {
        const value = event.target.value;
        if(!isNaN(value) && value >= 0){
            setPrice(value);
            setErrorMessage(null);
        } else { setErrorMessage('Please enter a positive whole number price')};
    }

    const handleClose = () => {
        setErrorMessage(null);
        setPreviewData(null);
        onClose();
    }

    const limitOrder = async (buysell) => {
        const order = {
            price: price,
            amount: amount,
            pirateId: pirate.pirateid,
        }
        buysell ? order.userBuyId = user.id : order.userSellId = user.id;
        !buysell ? order.userBuyId = null : order.userSellId = null;
        await axios.post('/api/transactions/newlimitorder', order);
        handleClose();
    }

    const fetchMarketOrderPreview = async (isBuyOrder) => {
        setErrorMessage(null);
        setPreviewData(null);
        
        if(amount <= 0) {
            setErrorMessage('Amount must be greater than 0');
        }

        console.log(JSON.stringify({
            buyid: isBuyOrder ? user.id : null,
            sellid: isBuyOrder ? null : user.id,
            pirateid: pirate.pirateid,
            amount: parseInt(amount)
        }))
        try {
            const response = await fetch ('/api/transactions/marketorder/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify({
                    buyid: isBuyOrder ? user.id : null,
                    sellid: isBuyOrder ? null : user.id,
                    pirateid: pirate.pirateid,
                    amount: parseInt(amount)
                })
            });
            if(response.ok) {
                const data = await response.json();
                console.log(data)
                setPreviewData(data);
            } else {
                const errorData = await response.json();
                console.error('error fetching preview:', errorData);
                setErrorMessage(errorData.message || 'Error fetching preview');
            }
        } catch (err) {
            console.log('Error fetching preview:', err);
            setErrorMessage('Failed to fetch preview');
        }
    }

    const placeMarketOrder = async (isBuyOrder) => {
        if(!previewData) {
            setErrorMessage('preview transaction first');
            return;
        }

        const orderData = {
            amount: parseInt(amount),
            pirateid: pirate.pirateid,
            buyid: isBuyOrder ? user.id : null, //REPLACE
            sellid: isBuyOrder ? null : user.id //REPLACE
        };

        try {
            const response = await fetch('/api/transactions/marketorder/place', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                  },
                body: JSON.stringify(orderData),
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Market order placed successfully', data)
                onClose();
            } else {
                const errorData = await response.json();
                console.log('Error placing market order:', errorData);
                setErrorMessage(errorData.message || 'Error placing order');
            }
        } catch (err) {
            console.log('Error placing market order:', err);
            setErrorMessage('Failed to place market order');
        }
    }

    if (!isOpen) return null;

    return (
        
        <div className="pirateModal">
            <div className="modal-content">
                
                <div className="chart-container">
                    <PirateChart data = {chartData}></PirateChart>
                </div>
                <div className="text-content">
                <h2>{pirate.piratename}</h2>
                <p>Price: {pirate.price}</p>
                <p>Crew: {pirate.crewname}</p>
                <img src={imageUrl} alt={pirate.name} /> {/* Example of additional content */}
                <div className = "orderStuff">
                {user.id && (
                    <div>
                    <div>
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={price}
                        onChange={handlePriceChange}
                        min="1"
                        />
                    {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
                </div>

                <div>
                    <button className='buyButton' onClick={() => fetchMarketOrderPreview(true)}>
                        Market Buy
                    </button>
                    <button className='sellButton' onClick={() => fetchMarketOrderPreview(false)}>
                        Market Sell
                    </button>
                </div>

                <div>
                Limit Price:<input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        min="1"
                        />
                    <button className='buyButton' onClick={() => limitOrder(true)}>Limit Buy</button>
                    <button className='sellButton' onClick={() => limitOrder(false)}>Limit Sell</button>
                </div>

                </div>
                )}
                </div>
                
                
                </div>
                {previewData && (
                    <div className="previewDialog">
                        <h3>Preview Order</h3>
                        <p><strong>Amount to be bought/sold:</strong> {previewData.amountBought}</p>
                        <p><strong>Total Cost/Proceeds:</strong> {previewData.balanceTotal}</p>
                        
                        <div>
                            {/* Button to confirm the order */}
                            {previewData.buysell && <button className='buyButton' onClick={() => placeMarketOrder(true)}>
                                Confirm Market Buy Order
                            </button> }
                            {!previewData.buysell && <button className='sellButton'onClick={() => placeMarketOrder(false)}>
                                Confirm Market Sell Order
                            </button>}
                        </div>
                    </div>
                )}
                <span className="close" onClick={handleClose}>&times;</span>
            </div>
        </div>
    );
}

export default PirateModal;