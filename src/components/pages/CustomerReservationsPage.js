import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';
import { API_URL } from '../../api';


function CustomerReservationsPage({ user }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReservations = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to view reservations.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/reservations/myreservations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch reservations.');
            const data = await response.json();
            setReservations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleCancel = async (reservationId) => {
        const reason = window.prompt('Please provide a reason for cancellation:');
        if (reason === null) return;
        if (!reason.trim()) {
            alert('A reason is required to cancel.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reason })
            });
            if (!response.ok) throw new Error('Failed to cancel reservation.');
            fetchReservations();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <p>Loading your reservations...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-10">My Reservations</h2>
            {reservations.length === 0 ? (
                <p className="text-center text-gray-600">You have no reservations.</p>
            ) : (
                <div className="space-y-6">
                    {reservations.map(res => (
                        <div key={res.ReservationID} className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-semibold text-pink-500">{res.ServiceName}</h3>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    res.Status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                    res.Status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    res.Status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {res.Status}
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4 text-gray-700">
                                <p className="flex items-center"><User className="mr-2 h-5 w-5"/> <strong>Therapist:</strong> {res.TherapistName}</p>
                                <p className="flex items-center"><Calendar className="mr-2 h-5 w-5"/> <strong>Date:</strong> {new Date(res.ReservationDateTime).toLocaleDateString()}</p>
                                <p className="flex items-center"><Clock className="mr-2 h-5 w-5"/> <strong>Time:</strong> {new Date(res.ReservationDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                <p className="flex items-center"><Tag className="mr-2 h-5 w-5"/> <strong>Price:</strong> ${res.Price.toFixed(2)}</p>
                            </div>
                            {res.Status === 'Confirmed' && (
                                <div className="text-right mt-4">
                                    <button onClick={() => handleCancel(res.ReservationID)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center ml-auto">
                                        <XCircle className="mr-2 h-5 w-5"/> Cancel Booking
                                    </button>
                                </div>
                            )}
                            {res.Status === 'Cancelled' && res.CancellationReason && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                    <p className="flex items-center text-sm text-gray-600"><Info className="mr-2 h-4 w-4 text-gray-500"/><strong>Reason:</strong> <span className="ml-2 italic">{res.CancellationReason}</span></p>
                                    <p className="flex items-center text-sm text-gray-600 mt-1"><Clock className="mr-2 h-4 w-4 text-gray-500"/><strong>Cancelled On:</strong> <span className="ml-2">{new Date(res.CancelledAt).toLocaleString()}</span></p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomerReservationsPage;