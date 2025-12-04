import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function AllReservationsCalendar({ therapists }) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('Confirmed');
    const [selectedReservation, setSelectedReservation] = useState(null);

    const fetchReservations = useCallback(async () => {
        const token = localStorage.getItem('token');
        const startDate = new Date(currentWeek);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const startDateStr = startDate.toISOString().split('T')[0];

        const query = new URLSearchParams({
            startDate: startDateStr,
            employeeId: employeeFilter,
            status: statusFilter,
        }).toString();
        
        try {
            const response = await fetch(`${API_URL}/reservations/all?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch reservations.');
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error(error);
        }
    }, [currentWeek, employeeFilter, statusFilter]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const handleCancel = async (reservationId) => {
        const reason = window.prompt('Please provide a reason for cancellation (for admin log):');
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
            setSelectedReservation(null);
        } catch (err) {
            alert(err.message);
        }
    };
    
    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };

    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(currentWeek);
        d.setDate(d.getDate() - d.getDay() + i);
        return d;
    }), [currentWeek]);

    const employeeColors = useMemo(() => {
        const colors = ['bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-indigo-200', 'bg-teal-200'];
        if (!Array.isArray(therapists)) return {};
        return therapists.reduce((acc, therapist, index) => {
            acc[therapist.id] = colors[index % colors.length];
            return acc;
        }, {});
    }, [therapists]);

    return (
        <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center">Weekly Reservation Calendar</h3>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                <div className="font-semibold text-lg">{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</div>
                <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
            </div>
             <div className="flex justify-center gap-4 mb-4 flex-wrap">
                <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="p-2 border rounded-lg">
                    <option value="all">All Employees</option>
                    {Array.isArray(therapists) && therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-lg">
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="all">All Statuses</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="border rounded-lg p-2 min-h-[200px] bg-gray-50">
                        <p className="font-bold text-center">{day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}</p>
                        <div className="space-y-2 mt-2">
                            {reservations
                                .filter(r => new Date(r.ReservationDateTime).toDateString() === day.toDateString())
                                .sort((a,b) => new Date(a.ReservationDateTime) - new Date(b.ReservationDateTime))
                                .map(r => (
                                     <div 
                                        key={r.ReservationID} 
                                        onClick={() => setSelectedReservation(r)}
                                        className={`p-3 rounded-lg shadow-sm cursor-pointer ${
                                            r.Status === 'Cancelled' ? 'bg-red-200 text-gray-500 line-through decoration-red-500 decoration-2' : 
                                            employeeColors[r.EmployeeID] || 'bg-gray-200'
                                        }`}
                                    >
                                        <p className="font-bold text-sm">{new Date(r.ReservationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-xs">{r.ServiceName}</p>
                                        <p className="text-xs italic">{r.CustomerName}</p>
                                        <p className="text-xs font-semibold mt-1 border-t border-gray-400/50 pt-1">{r.EmployeeName}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))}
            </div>
            {selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={() => setSelectedReservation(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h4 className="text-xl font-bold mb-4">{selectedReservation.ServiceName}</h4>
                        <p><strong>Status:</strong> {selectedReservation.Status}</p>
                        <p><strong>Therapist:</strong> {selectedReservation.EmployeeName}</p>
                        <p><strong>Client:</strong> {selectedReservation.CustomerName}</p>
                        <p><strong>Client Phone:</strong> {selectedReservation.CustomerPhone}</p>
                        <p><strong>Date:</strong> {new Date(selectedReservation.ReservationDateTime).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {new Date(selectedReservation.ReservationDateTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                        <p><strong>Duration:</strong> {selectedReservation.DurationMinutes} mins</p>
                        {selectedReservation.Status === 'Cancelled' && (
                             <div className="mt-2 pt-2 border-t">
                                <p><strong>Cancellation Reason:</strong> {selectedReservation.CancellationReason}</p>
                                <p><strong>Cancelled At:</strong> {new Date(selectedReservation.CancelledAt).toLocaleString()}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setSelectedReservation(null)} className="bg-gray-300 px-4 py-2 rounded-lg">Close</button>
                            {selectedReservation.Status === 'Confirmed' && (
                                <button onClick={() => handleCancel(selectedReservation.ReservationID)} className="bg-red-500 text-white px-4 py-2 rounded-lg">Cancel</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AllReservationsCalendar;