import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function ResetPasswordPage({ token, navigate }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred.');
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        }
    };

    if (!token) {
        return <p className="text-center text-red-500">Invalid or missing reset token.</p>;
    }

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center"><KeyRound className="mr-2"/> Reset Password</h2>
                {message && <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-4"> <p>{message}</p> <button onClick={() => navigate('login')} className="font-bold underline mt-2">Go to Login</button> </div>}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                {!message && (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">New Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="confirm-password">Confirm New Password</label>
                            <input type="password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <button type="submit" className="w-full bg-pink-500 text-white p-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">Update Password</button>
                    </>
                )}
            </form>
        </div>
    );
}

export default ResetPasswordPage;