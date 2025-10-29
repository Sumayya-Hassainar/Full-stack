import React, { useState } from 'react';
import { auth, saveToken, saveUser } from '../api';

export default function Auth() {
  const [mode, setMode] = useState('login'); // login / signup
  const [form, setForm] = useState({ name: '', email:'', password:'' });
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(mode === 'signup') {
        const res = await auth.signup({ name: form.name, email: form.email, password: form.password });
        saveToken(res.token); saveUser(res.user);
        window.location.href = '/dashboard';
      } else {
        const res = await auth.login({ email: form.email, password: form.password });
        saveToken(res.token); saveUser(res.user);
        window.location.href = '/dashboard';
      }
    } catch(error) {
      setErr(error.data?.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{mode === 'signup' ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && <div><input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /></div>}
        <div><input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} /></div>
        <div><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} /></div>
        <button type="submit">{mode === 'signup' ? 'Sign up' : 'Login'}</button>
      </form>
      <div style={{ color:'red' }}>{err}</div>
      <div style={{ marginTop: 10 }}>
        <button onClick={()=>setMode(mode === 'signup' ? 'login' : 'signup')}>
          {mode === 'signup' ? 'Have an account? Login' : "Don't have account? Sign up"}
        </button>
      </div>
    </div>
  );
}
