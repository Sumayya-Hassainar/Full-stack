import React, { useEffect, useState } from 'react';
import { swaps } from '../api';

export default function Requests(){
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const load = async () => {
    try {
      const res = await swaps.getRequests();
      setIncoming(res.incoming);
      setOutgoing(res.outgoing);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(()=> { load(); }, []);

  const respond = async (id, accept) => {
    try {
      await swaps.respond(id, { accept });
      await load();
    } catch(err) {
      alert(err.data?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Incoming Requests</h2>
      {incoming.length === 0 ? <p>No incoming</p> : incoming.map(r => (
        <div key={r._id} style={{ border:'1px solid #ddd', padding:8, margin:8 }}>
          From: {r.requester.name || r.requester.email} <br/>
          Their slot: {r.mySlot.title} ({new Date(r.mySlot.startTime).toLocaleString()}) <br/>
          Your slot: {r.theirSlot.title} ({new Date(r.theirSlot.startTime).toLocaleString()}) <br/>
          Status: {r.status} <br/>
          {r.status === 'PENDING' && (
            <>
              <button onClick={()=>respond(r._id, true)}>Accept</button>
              <button onClick={()=>respond(r._id, false)} style={{ marginLeft: 6 }}>Reject</button>
            </>
          )}
        </div>
      ))}

      <h2>Outgoing Requests</h2>
      {outgoing.length === 0 ? <p>No outgoing</p> : outgoing.map(r => (
        <div key={r._id} style={{ border:'1px solid #ddd', padding:8, margin:8 }}>
          To: {r.responder.name || r.responder.email} <br/>
          Your slot offered: {r.mySlot.title} <br/>
          Requested slot: {r.theirSlot.title} <br/>
          Status: {r.status}
        </div>
      ))}
    </div>
  );
}
