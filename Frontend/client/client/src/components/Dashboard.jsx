import React, { useEffect, useState } from 'react';
import { events } from '../api';

export default function Dashboard(){
  const [eventsList, setEventsList] = useState([]);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await events.list();
      setEventsList(res);
    } catch(err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(()=> { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await events.create(form);
      setForm({ title:'', startTime:'', endTime:'' });
      await load();
    } catch(err) { console.error(err); }
  };

  const toggleSwappable = async (ev) => {
    const next = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    await events.update(ev._id, { status: next });
    await load();
  };

  const remove = async (id) => {
    await events.delete(id);
    await load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Events</h2>
      <form onSubmit={create}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} />
        <input placeholder="Start (ISO)" value={form.startTime} onChange={e=>setForm({...form, startTime: e.target.value})} />
        <input placeholder="End (ISO)" value={form.endTime} onChange={e=>setForm({...form, endTime: e.target.value})} />
        <button type="submit">Create</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul>
          {eventsList.map(ev => (
            <li key={ev._id} style={{ margin: '8px 0', border:'1px solid #ddd', padding:8 }}>
              <strong>{ev.title}</strong> <br />
              {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()} <br />
              Status: {ev.status} <br />
              <button onClick={()=>toggleSwappable(ev)}>{ev.status === 'SWAPPABLE' ? 'Unmark Swappable' : 'Make Swappable'}</button>
              <button onClick={()=>remove(ev._id)} style={{ marginLeft: 6 }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
