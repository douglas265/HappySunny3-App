import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function LoginPage({ onLogin, navigate }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed.');
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center"><LogIn className="mr-2"/> Login</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <button type="submit" className="w-full bg-pink-500 text-white p-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">Login</button>
                <div className="text-center mt-4">
                    <button onClick={() => navigate('forgotPassword')} className="text-sm text-pink-500 hover:underline">Forgot Password?</button>
                    <p className="text-sm text-gray-600 mt-2">
                        Don't have an account? <button onClick={() => navigate('signup')} className="text-pink-500 hover:underline font-semibold">Sign Up</button>
                    </p>
                </div>
            </form>
        </div>
    );
}

export default BookingPage;
