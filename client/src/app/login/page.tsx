'use client';

import { useEffect, useState } from 'react';
import axios from '../axiosInstance';
import { useRouter } from 'next/navigation';
import './style.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get('/',{
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },  
        });
        if (response.status === 200) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h1 className="login-title">Welcome 👋</h1>
        <p className="text-center text-gray-500 mb-6">Get access to the Raspberry Pi dashboard!</p>
        {error && <p className="login-error mb-6">{error}</p>}

        <div className="login-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
          />
        </div>
        <div className="login-form mt-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
        </div>

        <button type="submit" className="login-button mt-4 w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className={`server-status ${serverStatus}`}>
        <span className="font-bold">Server Status:</span>
        <br />
        {serverStatus === 'loading' ? (
          <span className="text-gray-500 font-medium">Checking...</span>
        ) : serverStatus === 'online' ? (
          <span className="text-green-600 font-medium">🟢 Online</span>
        ) : (
          <span className="text-red-600 font-medium">🔴 Offline</span>
        )}
      </div>
    </div>
  );
}
