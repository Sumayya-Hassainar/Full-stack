import React, { useEffect, useState } from 'react';
import { swaps, events } from '../api';

export default function Marketplace(){
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await swaps.listSwappable();
      setSlots(s);
      const mine = await events.list();
      setMySwappables(mine.filter(e => e.status === 'SWAPPABLE'));
    } catch(err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  const requestSwap = async (theirId) => {
    const myId = selectedOffer[theirId];
    if(!myId) return alert('Choose one of your SWAPPABLE slots to offer');
    try {
      await swaps.createRequest({ mySlotId: myId, theirSlotId: theirId });
      alert('Swap request sent');
      await load();
    } catch(err) {
      alert(err.data?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Marketplace — Swappable slots</h2>
      {loading ? <p>Loading...</p> : slots.length === 0 ? <p>No swappable slots found</p> : (
        <ul>
          {slots.map(s => (
            <li key={s._id} style={{ margin:10, border:'1px solid #ddd', padding:8 }}>
              <strong>{s.title}</strong> by {s.owner.name || s.owner.email} <br/>
              {new Date(s.startTime).toLocaleString()} - {new Date(s.endTime).toLocaleString()} <br/>
              Offer with:
              <select onChange={e => setSelectedOffer({...selectedOffer, [s._id]: e.target.value})}>
                <option value="">-- choose my swappable slot --</option>
                {mySwappables.map(m => <option key={m._id} value={m._id}>{m.title} ({new Date(m.startTime).toLocaleString()})</option>)}
              </select>
              <button onClick={()=>requestSwap(s._id)}>Request Swap</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
