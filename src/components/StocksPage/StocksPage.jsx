import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';

// This is one of our simplest components
// It doesn't have local state,
// It doesn't dispatch any redux actions or display any part of redux state
// or even care what the redux state is'

function StocksPage() {
    const [pirateRows, setPirateRows] = useState([])
    const [loading, setLoading] = useState(true);

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

  if(loading) {
    return(<div>Loading,,,</div>)
  }

  return (
    <div className="container">
      <div>
        {console.log(pirateRows)}
        {pirateRows.map((pirateRow) => (
            <li> {pirateRow.pirateid}, {pirateRow.piratename}, {pirateRow.price}</li>
        ))}
      </div>
    </div>
  );
}

export default StocksPage;
