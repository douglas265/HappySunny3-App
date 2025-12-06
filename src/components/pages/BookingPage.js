import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';
import { API_URL } from '../../api';

function BookingPage({ user, navigate, services }) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [filteredTherapists, setFilteredTherapists] = useState([]);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimes, setAvailableTimes] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    // Added state to track therapist loading for Step 2
    const [isLoadingTherapists, setIsLoadingTherapists] = useState(false);

    const fetchTherapistsForService = useCallback(async (serviceId) => {
        if (!serviceId) return;
        setIsLoadingTherapists(true); // Start loading
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Ensure navigation goes to the correct login/auth page
                navigate('login');
                return;
            }
            const response = await fetch(`${API_URL}/therapists?serviceId=${serviceId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not fetch therapists for this service.');
            const data = await response.json();
            setFilteredTherapists(data);
        } catch (err) {
            setError(err.message);
            setFilteredTherapists([]);
        } finally {
            setIsLoadingTherapists(false); // Stop loading
        }
    }, [navigate]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        fetchTherapistsForService(service.id);
        setStep(2);
    };

    const fetchAvailableTimes = useCallback(async () => {
        if (!selectedTherapist || !selectedService || !currentDate) return;
        setIsLoadingTimes(true);
        setError('');
        const dateStr = currentDate.toISOString().split('T')[0];
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            const [scheduleRes, reservationsRes] = await Promise.all([
                fetch(`${API_URL}/schedules/${selectedTherapist.id}`, { headers }),
                fetch(`${API_URL}/reservations/therapist/${selectedTherapist.id}?date=${dateStr}`, { headers })
            ]);

            if (!scheduleRes.ok || !reservationsRes.ok) throw new Error('Failed to fetch availability.');
            
            const schedule = await scheduleRes.json();
            const reservations = await reservationsRes.json();
            
            // Assume schedule is an object mapping date strings to {start: "HH:MM:SS", end: "HH:MM:SS"}
            // or directly contains the schedule for the current date based on the URL structure
            // If the backend returns the schedule only for the therapist (which is what the endpoint implies),
            // we need to locate the schedule for the current day. Since the backend endpoint
            // is structured as `/schedules/{therapistId}`, we assume `schedule` is an object where
            // keys are date strings and values are {start, end}. If the backend only returns
            // one day's schedule, this logic needs adjustment. Sticking to the original map key lookup:
            const daySchedule = schedule[dateStr] || schedule.schedule?.[dateStr];

            if (!daySchedule || !daySchedule.start || !daySchedule.end) {
                setAvailableTimes([]);
                return;
            }

            const serviceDuration = selectedService.duration;
            const openTime = new Date(`${dateStr}T${daySchedule.start}`);
            const closeTime = new Date(`${dateStr}T${daySchedule.end}`);
            
            let potentialSlots = [];
            let currentTime = new Date(openTime);

            // Increment time slot by 15 minutes
            while (currentTime < closeTime) {
                const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
                if (slotEnd <= closeTime) {
                    potentialSlots.push(new Date(currentTime));
                }
                currentTime.setMinutes(currentTime.getMinutes() + 15);
            }

            const bookedSlots = reservations.map(r => {
                const start = new Date(r.ReservationDateTime);
                // Note: assuming r.DurationMinutes exists and is a number, based on your original logic
                const end = new Date(start.getTime() + r.DurationMinutes * 60000); 
                return { start, end };
            });

            const finalSlots = potentialSlots.filter(slotStart => {
                const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
                // Check for overlap with existing bookings
                return !bookedSlots.some(bookedSlot => 
                    (slotStart < bookedSlot.end && slotEnd > bookedSlot.start)
                );
            });
            
            setAvailableTimes(finalSlots);
        } catch (err) {
            setError(err.message);
            setAvailableTimes([]);
        } finally {
            setIsLoadingTimes(false);
        }
    }, [selectedTherapist, selectedService, currentDate]);

    useEffect(() => {
        if (step === 3) {
            fetchAvailableTimes();
        }
    }, [step, fetchAvailableTimes]);
    
    const handleConfirmBooking = async () => {
        if (!user) {
            // Ensure navigation goes to the correct login/auth page before confirming
            navigate('login');
            return;
        }
        setError('');
        setSuccessMessage('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    serviceId: selectedService.id,
                    therapistId: selectedTherapist.id,
                    dateTime: selectedTime,
                }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to confirm booking.');
            
            setSuccessMessage('Your reservation has been confirmed!');
            setTimeout(() => navigate('myReservations'), 2000);
        } catch (err) {
            // NOTE: Using a custom modal/toast/snackbar for errors instead of alert()
            setError(err.message);
        }
    };
    
    const changeWeek = (direction) => {
        setSelectedTime(''); // Clear selected time on week change
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };
    
    const renderStep = () => {
        // SAFETY CHECK: Ensure services is an array, gracefully handle loading/empty state
        if (step === 1) return (
            <div>
                <h3 className="text-2xl font-semibold mb-4 text-center">Step 1: Choose a Service</h3>
                {(!services || services.length === 0) ? (
                    <p className="text-center text-gray-500">Loading services or no services available...</p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {services.map(s => (
                            <button key={s.id} onClick={() => handleServiceSelect(s)}
                                className="p-4 border rounded-lg text-left hover:bg-pink-100 hover:border-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <p className="font-bold">{s.name}</p>
                                <p className="text-sm text-gray-600">{s.duration} mins - ${s.price.toFixed(2)}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
        if (step === 2) return (
            <div>
                 <h3 className="text-2xl font-semibold mb-4 text-center">Step 2: Choose a Therapist</h3>
                 {isLoadingTherapists ? (
                    <p className="col-span-full text-center">Loading therapists...</p>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredTherapists.length > 0 ? filteredTherapists.map(t => (
                            <button key={t.id} onClick={() => { setSelectedTherapist(t); setStep(3); }}
                                className="p-4 border rounded-lg hover:bg-pink-100 hover:border-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <User className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                                <p className="font-bold text-center">{t.name}</p>
                            </button>
                        )) : <p className="col-span-full text-center">No therapists available for this service.</p>}
                    </div>
                 )}
            </div>
        );
        if (step === 3) {
            // Fixed logic: D.setDate should calculate relative to the current month/year/day
            // This is the correct way to calculate the start of the week for a given date object `currentDate`.
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); 
            
            const weekDays = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                return d;
            });

            return (
                <div>
                    <h3 className="text-2xl font-semibold mb-4 text-center">Step 3: Choose a Date & Time</h3>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                        {/* Displaying week range based on calculated days */}
                        <span className="font-semibold">{weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {weekDays.map(day => (
                            <button key={day.toString()} 
                                onClick={() => { setCurrentDate(day); setSelectedTime(''); }} // Reset selected time when date changes
                                className={`p-2 border rounded-lg text-center ${currentDate.toDateString() === day.toDateString() ? 'bg-pink-500 text-white' : 'hover:bg-pink-100'}`}>
                                <p className="text-sm">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                <p className="font-bold">{day.getDate()}</p>
                            </button>
                        ))}
                    </div>
                    {isLoadingTimes ? <p className="text-center">Loading times...</p> : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {availableTimes.length > 0 ? availableTimes.map(time => (
                                <button key={time.toString()} onClick={() => { setSelectedTime(time); setStep(4); }}
                                    className={`p-2 border rounded-lg ${selectedTime === time ? 'bg-pink-500 text-white' : 'hover:bg-pink-100'}`}>
                                    {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </button>
                            )) : <p className="col-span-full text-center text-gray-500">No available times for this day.</p>}
                        </div>
                    )}
                </div>
            );
        }
        if (step === 4) return (
            <div>
                <h3 className="text-2xl font-semibold mb-6 text-center">Step 4: Confirm Your Booking</h3>
                <div className="bg-white p-6 rounded-lg shadow-inner border space-y-3">
                    {/* Rendered output should convert to a readable string as 'selectedTime' is a Date object */}
                    <div className="flex items-center"><Scissors className="mr-3 text-pink-500"/><strong>Service:</strong><span className="ml-2">{selectedService.name}</span></div>
                    <div className="flex items-center"><User className="mr-3 text-pink-500"/><strong>Therapist:</strong><span className="ml-2">{selectedTherapist.name}</span></div>
                    <div className="flex items-center"><Calendar className="mr-3 text-pink-500"/><strong>Date:</strong><span className="ml-2">{new Date(selectedTime).toLocaleDateString()}</span></div>
                    <div className="flex items-center"><Clock className="mr-3 text-pink-500"/><strong>Time:</strong><span className="ml-2">{new Date(selectedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="flex items-center pt-3 border-t"><DollarSign className="mr-3 text-pink-500"/><strong>Price:</strong><span className="ml-2">${selectedService.price.toFixed(2)}</span></div>
                </div>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
                <button onClick={handleConfirmBooking}
                    className="w-full mt-6 bg-pink-500 text-white font-bold py-3 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <Check className="mr-2"/> Confirm Booking
                </button>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                {step > 1 && (
                    // Reset filteredTherapists only if backing out of Step 2, otherwise maintain selections
                    <button onClick={() => { 
                        setStep(step - 1); 
                        if (step === 2) setFilteredTherapists([]); 
                    }} className="flex items-center text-gray-600 hover:text-black">
                        <ChevronLeft className="mr-1" /> Back
                    </button>
                )}
                <div className="flex-grow"></div>
            </div>
            {renderStep()}
        </div>
    );
}

export default BookingPage;