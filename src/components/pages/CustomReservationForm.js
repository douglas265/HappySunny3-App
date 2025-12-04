import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function CustomReservationForm({ services, therapists }) {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const today = new Date().toISOString().split('T')[0];

    const fetchAvailableTimesCustom = useCallback(async () => {
        if (!selectedTherapist || !selectedService || !selectedDate) return;
        
        const dateStr = selectedDate.toISOString().split('T')[0];
        try {
            const token = localStorage.getItem('token');
            const [scheduleRes, reservationsRes] = await Promise.all([
                fetch(`${API_URL}/schedules/${selectedTherapist.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/reservations/therapist/${selectedTherapist.id}?date=${dateStr}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!scheduleRes.ok || !reservationsRes.ok) throw new Error('Failed to fetch availability.');
            
            const schedule = await scheduleRes.json();
            const reservations = await reservationsRes.json();
            const daySchedule = schedule[dateStr];

            if (!daySchedule) { setAvailableTimes([]); return; }

            const serviceDuration = selectedService.duration;
            const openTime = new Date(`${dateStr}T${daySchedule.start}`);
            const closeTime = new Date(`${dateStr}T${daySchedule.end}`);
            let potentialSlots = [];
            let currentTime = new Date(openTime);

            while (currentTime < closeTime) {
                const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
                if (slotEnd <= closeTime) potentialSlots.push(new Date(currentTime));
                currentTime.setMinutes(currentTime.getMinutes() + 15);
            }

            const bookedSlots = reservations.map(r => ({
                start: new Date(r.ReservationDateTime),
                end: new Date(new Date(r.ReservationDateTime).getTime() + r.DurationMinutes * 60000)
            }));
            
            const filteredSlots = potentialSlots.filter(slotStart => {
                const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
                return !bookedSlots.some(booked => slotStart < booked.end && slotEnd > booked.start);
            });
            
            setAvailableTimes(filteredSlots);
        } catch (err) {
            setError(err.message);
            setAvailableTimes([]);
        }
    }, [selectedTherapist, selectedService, selectedDate]);
    
    useEffect(() => {
        fetchAvailableTimesCustom();
    }, [fetchAvailableTimesCustom]);
    
    const handleCustomBooking = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/reservations/custom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    serviceId: selectedService.id,
                    therapistId: selectedTherapist.id,
                    dateTime: selectedTime,
                    customerName,
                    customerPhone,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create booking.');
            setSuccessMessage('Reservation created successfully!');
            setSelectedService(null);
            setSelectedTherapist(null);
            setSelectedTime('');
            setCustomerName('');
            setCustomerPhone('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 text-center">Create a Custom Reservation</h3>
            <form onSubmit={handleCustomBooking} className="space-y-4">
                 <div>
                    <label className="block font-semibold">Service</label>
                    <select onChange={e => setSelectedService(services.find(s => s.id === parseInt(e.target.value)))} className="w-full p-2 border rounded-lg mt-1" required>
                        <option value="">Select a Service</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block font-semibold">Therapist</label>
                    <select onChange={e => setSelectedTherapist(therapists.find(t => t.id === parseInt(e.target.value)))} className="w-full p-2 border rounded-lg mt-1" required>
                        <option value="">Select a Therapist</option>
                        {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block font-semibold">Date</label>
                    <input type="date" min={today} onChange={e => setSelectedDate(new Date(e.target.value + 'T00:00:00'))} value={selectedDate.toISOString().split('T')[0]} className="w-full p-2 border rounded-lg mt-1" required/>
                </div>
                <div>
                    <label className="block font-semibold">Time</label>
                    <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full p-2 border rounded-lg mt-1" required disabled={!selectedService || !selectedTherapist}>
                        <option value="">Select a Time</option>
                        {availableTimes.map(time => <option key={time.toISOString()} value={time.toISOString()}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block font-semibold">Customer Name</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded-lg mt-1" required/>
                </div>
                <div>
                    <label className="block font-semibold">Customer Phone</label>
                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded-lg mt-1" required/>
                </div>
                 {error && <p className="text-red-500 text-center">{error}</p>}
                {successMessage && <p className="text-green-500 text-center">{successMessage}</p>}
                <button type="submit" className="w-full bg-pink-500 text-white font-bold py-3 rounded-lg hover:bg-pink-600 transition-colors">
                    Create Reservation
                </button>
            </form>
        </div>
    );
}

export default CustomReservationForm;