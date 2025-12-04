import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

// Centralized API URL
const API_URL = 'https://lily-spa-backend.onrender.com/api';

// --- Page Components ---

function HomePage({ navigate, storeInfo }) {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-5xl font-extrabold text-pink-500 mb-4">Welcome to Lily Spa</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Discover a serene escape where expert nail care and luxurious pampering meet. At Lily Spa, we are dedicated to providing a clean, comfortable, and friendly environment for your ultimate relaxation.
      </p>
      
      <button 
        onClick={() => navigate('book')}
        className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-pink-600 transition-transform transform hover:scale-105 mb-16"
      >
        Book Your Appointment
      </button>

      <div className="my-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Experience Our Serenity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
                <img src="https://placehold.co/600x400/fbcfe8/db2777?text=Modern+Interior" alt="Modern and clean spa interior" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
                 <img src="https://placehold.co/600x400/fbcfe8/db2777?text=Relaxing+Manicure" alt="Close-up of a relaxing manicure" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg h-64">
                 <img src="https://placehold.co/600x400/fbcfe8/db2777?text=Luxurious+Pedicure" alt="Luxurious pedicure treatment" className="w-full h-full object-cover" />
            </div>
        </div>
    </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 my-12">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Sparkles className="mx-auto text-pink-500 h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Quality Services</h3>
          <p>Expert care from our certified and passionate nail technicians.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Calendar className="mx-auto text-pink-500 h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p>Schedule your next appointment online in just a few clicks.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Heart className="mx-auto text-pink-500 h-12 w-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Relaxing Atmosphere</h3>
          <p>Unwind in our clean, comfortable, and friendly environment.</p>
        </div>
      </div>

      {storeInfo && (
        <div className="mt-16 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl border">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Visit Us</h3>
            <p className="flex items-center justify-center text-gray-600 mb-2">
                <MapPin className="mr-2 text-pink-500"/> {storeInfo.Address}
            </p>
            <p className="flex items-center justify-center text-gray-600">
                <Clock className="mr-2 text-pink-500"/> Open daily from {storeInfo.OpeningTime} to {storeInfo.ClosingTime}
            </p>
        </div>
      )}
    </div>
  );
}

function ServicesPage({ services }) {
  const icons = [<Scissors key="1"/>, <Sparkles key="2"/>, <Droplet key="3"/>];

  return (
    <div className="animate-fade-in">
      <h2 className="text-4xl font-bold text-center mb-10">Our Services</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.length > 0 ? services.map((service, index) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex items-center mb-4">
              <div className="bg-pink-100 text-pink-500 p-3 rounded-full mr-4">
                {icons[index % icons.length]}
              </div>
              <h3 className="text-2xl font-semibold">{service.name}</h3>
            </div>
            <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
            <div className="flex justify-between items-center text-lg mt-auto pt-4 border-t">
              <span className="font-semibold text-pink-500">${service.price.toFixed(2)}</span>
              <span className="text-gray-500">{service.duration} mins</span>
            </div>
          </div>
        )) : <p>Loading services...</p>}
      </div>
    </div>
  );
}

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

    const fetchTherapistsForService = useCallback(async (serviceId) => {
        if (!serviceId) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('login'); // Redirect to login if trying to book without being logged in
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
            
            const daySchedule = schedule[dateStr];
            if (!daySchedule) {
                setAvailableTimes([]);
                return;
            }

            const serviceDuration = selectedService.duration;
            const openTime = new Date(`${dateStr}T${daySchedule.start}`);
            const closeTime = new Date(`${dateStr}T${daySchedule.end}`);
            
            let potentialSlots = [];
            let currentTime = new Date(openTime);

            while (currentTime < closeTime) {
                const slotEnd = new Date(currentTime.getTime() + serviceDuration * 60000);
                if (slotEnd <= closeTime) {
                    potentialSlots.push(new Date(currentTime));
                }
                currentTime.setMinutes(currentTime.getMinutes() + 15);
            }

            const bookedSlots = reservations.map(r => {
                const start = new Date(r.ReservationDateTime);
                const end = new Date(start.getTime() + r.DurationMinutes * 60000);
                return { start, end };
            });

            const finalSlots = potentialSlots.filter(slotStart => {
                const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
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
            setError(err.message);
        }
    };
    
    const changeWeek = (direction) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };
    
    const renderStep = () => {
        if (step === 1) return (
            <div>
                <h3 className="text-2xl font-semibold mb-4 text-center">Step 1: Choose a Service</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {services.map(s => (
                        <button key={s.id} onClick={() => handleServiceSelect(s)}
                            className="p-4 border rounded-lg text-left hover:bg-pink-100 hover:border-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <p className="font-bold">{s.name}</p>
                            <p className="text-sm text-gray-600">{s.duration} mins - ${s.price.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
        if (step === 2) return (
            <div>
                 <h3 className="text-2xl font-semibold mb-4 text-center">Step 2: Choose a Therapist</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredTherapists.length > 0 ? filteredTherapists.map(t => (
                        <button key={t.id} onClick={() => { setSelectedTherapist(t); setStep(3); }}
                            className="p-4 border rounded-lg hover:bg-pink-100 hover:border-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500">
                            <User className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                            <p className="font-bold text-center">{t.name}</p>
                        </button>
                    )) : <p className="col-span-full text-center">No therapists available for this service.</p>}
                </div>
            </div>
        );
        if (step === 3) {
            const weekDays = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - d.getDay() + i);
                return d;
            });
            return (
                <div>
                    <h3 className="text-2xl font-semibold mb-4 text-center">Step 3: Choose a Date & Time</h3>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                        <span className="font-semibold">{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                        <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {weekDays.map(day => (
                            <button key={day.toString()} onClick={() => setCurrentDate(day)}
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
                                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                    <button onClick={() => { setStep(step - 1); setFilteredTherapists([]); }} className="flex items-center text-gray-600 hover:text-black">
                        <ChevronLeft className="mr-1" /> Back
                    </button>
                )}
                <div className="flex-grow"></div>
            </div>
            {renderStep()}
        </div>
    );
}

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

function SignUpPage({ onSignUp }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phoneNumber }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Sign up failed.');
            onSignUp(data);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center"><UserPlus className="mr-2"/> Create Account</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g., 123-456-7890" required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-lg" required />
                </div>
                <button type="submit" className="w-full bg-pink-500 text-white p-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">Sign Up</button>
            </form>
        </div>
    );
}

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

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'An error occurred.');
            setMessage(data.message);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center"><Mail className="mr-2"/> Forgot Password</h2>
                {message && <p className="bg-green-100 text-green-800 p-3 rounded-lg mb-4">{message}</p>}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</p>}
                {!message && (
                    <>
                        <p className="text-center text-gray-600 mb-4">Enter your email and we'll send you a link to reset your password.</p>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" required />
                        </div>
                        <button type="submit" className="w-full bg-pink-500 text-white p-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors">Send Reset Link</button>
                    </>
                )}
            </form>
        </div>
    );
}

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

function SettingsPage({ user }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-4xl font-bold text-center mb-10">Settings</h2>
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
        <p className="text-lg"><strong>Name:</strong> {user?.name}</p>
        <p className="text-lg"><strong>Email:</strong> {user?.email}</p>
        <p className="text-lg capitalize"><strong>Role:</strong> {user?.role}</p>
        <div className="mt-6 pt-6 border-t">
            <h3 className="text-2xl font-semibold mb-4">Change Password</h3>
            <p className="text-gray-600">Password change functionality will be added here.</p>
        </div>
      </div>
    </div>
  );
}

// --- Employee Portal Components ---
function EmployeeServicesManager({ user, services }) {
    const [myServices, setMyServices] = useState(new Set());
    const [message, setMessage] = useState('');
    const [showAddDropdown, setShowAddDropdown] = useState(false);

    useEffect(() => {
        const fetchMyServices = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${API_URL}/employees/${user.internalId}/services`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch services.');
                const data = await response.json();
                setMyServices(new Set(data));
            } catch (error) {
                console.error(error);
            }
        };
        if (user.internalId) {
            fetchMyServices();
        }
    }, [user.internalId]);

    const handleDropService = (serviceId) => {
        setMyServices(prev => {
            const newServices = new Set(prev);
            newServices.delete(serviceId);
            return newServices;
        });
    };

    const handleAddService = (serviceId) => {
        setMyServices(prev => {
            const newServices = new Set(prev);
            newServices.add(serviceId);
            return newServices;
        });
        setShowAddDropdown(false);
    };

    const handleSaveServices = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/employees/${user.internalId}/services`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ serviceIds: Array.from(myServices) }),
            });
            if (!response.ok) throw new Error('Failed to save services.');
            setMessage('Services updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving services.');
        }
    };

    const assignedServices = useMemo(() => services.filter(s => myServices.has(s.id)), [services, myServices]);
    const unassignedServices = useMemo(() => services.filter(s => !myServices.has(s.id)), [services, myServices]);

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center">My Provided Services</h3>
            <div className="space-y-2 mb-6">
                {assignedServices.length > 0 ? assignedServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                        <span>{service.name}</span>
                        <button onClick={() => handleDropService(service.id)} className="text-red-500 hover:text-red-700 flex items-center text-sm">
                            <Trash2 size={16} className="mr-1"/> Drop
                        </button>
                    </div>
                )) : <p className="text-center text-gray-500">You are not assigned to any services yet.</p>}
            </div>

            <div className="text-center">
                <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center mx-auto hover:bg-green-600">
                    <PlusCircle className="inline mr-2"/> Add Service
                </button>
                {showAddDropdown && (
                    <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Select a service to add:</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {unassignedServices.length > 0 ? unassignedServices.map(service => (
                                <button key={service.id} onClick={() => handleAddService(service.id)} className="p-2 border rounded hover:bg-pink-100">
                                    {service.name}
                                </button>
                            )) : <p className="col-span-full text-gray-500">All available services have been assigned.</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-6 border-t pt-6">
                <button onClick={handleSaveServices} className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 flex items-center mx-auto">
                    <Save className="mr-2 h-5 w-5"/> Save Changes
                </button>
                {message && <p className="mt-4 text-green-600">{message}</p>}
            </div>
        </div>
    );
}

function EmployeeCalendar({ user }) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const fetchReservations = useCallback(async () => {
        const token = localStorage.getItem('token');
        const startDate = new Date(currentWeek);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const startDateStr = startDate.toISOString().split('T')[0];
        try {
            const response = await fetch(`${API_URL}/reservations/employee?startDate=${startDateStr}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch reservations.');
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error(error);
        }
    }, [currentWeek]);

    useEffect(() => {
        if(user.internalId) fetchReservations();
    }, [fetchReservations, user.internalId]);

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

    return (
        <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center">My Weekly Schedule</h3>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                <div className="font-semibold text-lg">{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</div>
                <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
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
                                            r.Status === 'Completed' ? 'bg-blue-200' : 'bg-green-200'
                                        }`}
                                    >
                                        <p className="font-bold text-sm">{new Date(r.ReservationDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-xs">{r.ServiceName}</p>
                                        <p className="text-xs italic">{r.CustomerName}</p>
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
                        <button onClick={() => setSelectedReservation(null)} className="mt-4 bg-gray-300 px-4 py-2 rounded-lg">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScheduleEditor({ user, storeInfo }) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [schedule, setSchedule] = useState({});
    const [message, setMessage] = useState('');

    const generateTimeSlots = useCallback((openingTime, closingTime) => {
        if (!openingTime || !closingTime) return [];
        
        let slots = [];
        let [openHour, openMinute] = openingTime.split(':').map(Number);
        
        let closeDate = new Date();
        let [closeHour, closeMinute] = closingTime.split(':').map(Number);
        closeDate.setHours(closeHour, closeMinute, 0, 0);
        closeDate.setMinutes(closeDate.getMinutes() - 30);

        let currentTime = new Date();
        currentTime.setHours(openHour, openMinute, 0, 0);

        while (currentTime <= closeDate) {
            slots.push(currentTime.toTimeString().substring(0, 5));
            currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
        return slots;
    }, []);

    const timeSlots = useMemo(() => 
        generateTimeSlots(storeInfo?.OpeningTime, storeInfo?.ClosingTime),
    [storeInfo, generateTimeSlots]);

    const fetchSchedule = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/schedules/${user.internalId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch schedule.');
            const data = await response.json();
            setSchedule(data);
        } catch (error) {
            console.error(error);
        }
    }, [user.internalId]);

    useEffect(() => {
        if(user.internalId) fetchSchedule();
    }, [fetchSchedule, currentWeek, user.internalId]);

    const handleTimeChange = (date, type, value) => {
        const dateStr = date.toISOString().split('T')[0];
        setSchedule(prev => ({
            ...prev,
            [dateStr]: { ...prev[dateStr], [type]: value }
        }));
    };
    
    const handleSave = async () => {
        const token = localStorage.getItem('token');
        setMessage('');
        
        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(currentWeek);
            d.setDate(d.getDate() - d.getDay() + i);
            return d;
        });

        for (const day of weekDays) {
            const dateStr = day.toISOString().split('T')[0];
            const daySchedule = schedule[dateStr];
            if (daySchedule) {
                if ((daySchedule.start && !daySchedule.end) || (!daySchedule.start && daySchedule.end)) {
                    alert(`Please select both a start and end time for ${dateStr}, or clear both.`);
                    return;
                }
                if (daySchedule.start && daySchedule.end && daySchedule.start >= daySchedule.end) {
                    alert(`End time must be after start time for ${dateStr}.`);
                    return;
                }
            }
        }
        
        const scheduleToSave = weekDays.map(day => {
            const dateStr = day.toISOString().split('T')[0];
            const daySchedule = schedule[dateStr];
            return {
                date: dateStr,
                start: daySchedule?.start || null,
                end: daySchedule?.end || null
            };
        });

        try {
            const response = await fetch(`${API_URL}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(scheduleToSave),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save schedule.');
            setMessage('Schedule saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.message);
        }
    };

    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(currentWeek);
        d.setDate(d.getDate() - d.getDay() + i);
        return d;
    }), [currentWeek]);

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center">Edit Weekly Schedule</h3>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                <span>{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
            </div>
            <div className="space-y-4">
                {weekDays.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const daySchedule = schedule[dateStr] || {};
                    return (
                        <div key={dateStr} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-2 rounded-lg bg-gray-50">
                            <div className="font-semibold text-center md:text-left">{day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                             <select value={daySchedule.start || ''} onChange={e => handleTimeChange(day, 'start', e.target.value)} className="p-2 border rounded-lg w-full">
                                <option value="">Start Time</option>
                                {timeSlots.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                            </select>
                            <select value={daySchedule.end || ''} onChange={e => handleTimeChange(day, 'end', e.target.value)} className="p-2 border rounded-lg w-full">
                                <option value="">End Time</option>
                                {timeSlots.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                            </select>
                        </div>
                    );
                })}
            </div>
            <div className="text-center mt-6">
                <button onClick={handleSave} className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center mx-auto">
                    <Save className="mr-2 h-5 w-5"/> Save Schedule
                </button>
                {message && <p className={`mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </div>
        </div>
    );
}

function EmployeePortal({ user, storeInfo, services }) {
    const [activeTab, setActiveTab] = useState('calendar');

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-4">Employee Portal</h2>
            <p className="text-center text-lg text-gray-600 mb-8">Welcome, {user?.name}!</p>
            
            <div className="flex justify-center border-b mb-8 flex-wrap">
                 <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'calendar' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                >
                    My Calendar
                </button>
                <button 
                    onClick={() => setActiveTab('schedule')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'schedule' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                >
                    My Schedule
                </button>
                 <button 
                    onClick={() => setActiveTab('myServices')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'myServices' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                >
                    My Services
                </button>
            </div>

            <div>
                {activeTab === 'calendar' && <EmployeeCalendar user={user} />}
                {activeTab === 'schedule' && <ScheduleEditor user={user} storeInfo={storeInfo} />}
                {activeTab === 'myServices' && <EmployeeServicesManager user={user} services={services} />}
            </div>
        </div>
    );
}

// --- Employer Portal Components ---



// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);

  const fetchPublicData = useCallback(async () => {
    try {
        const [servicesRes, storeInfoRes] = await Promise.all([
            fetch(`${API_URL}/services`),
            fetch(`${API_URL}/store-info`),
        ]);
        setServices(await servicesRes.json());
        setStoreInfo(await storeInfoRes.json());
    } catch (error) {
        console.error("Failed to fetch public data:", error);
    }
  }, []);
  
  const fetchTherapists = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const therapistsRes = await fetch(`${API_URL}/therapists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (therapistsRes.ok) {
            setTherapists(await therapistsRes.json());
        } else {
            setTherapists([]);
        }
      } catch (error) {
        console.error("Failed to fetch therapists:", error);
        setTherapists([]);
      }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      const token = path.split('/')[2];
      setResetToken(token);
      setPage('resetPassword');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);
  
  useEffect(() => {
      if (user) {
          fetchTherapists();
      }
  }, [user, fetchTherapists]);


  const navigate = (newPage) => {
    setPage(newPage);
    setIsMobileMenuOpen(false);
    if (newPage !== 'resetPassword') {
        const path = newPage === 'home' ? '/' : `/${newPage}`;
        window.history.pushState({}, '', path);
    }
    window.scrollTo(0, 0);
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    const role = data.user.role;
    if (role === 'customer') navigate('myReservations');
    else if (role === 'employee') navigate('employeePortal');
    else if (['employer', 'admin', 'frontdesk'].includes(role)) navigate('employerPortal');
    else navigate('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('home');
  };
  
  const renderPage = () => {
    const props = { user, navigate, services, therapists, storeInfo, onServicesUpdate: setServices, onUsersUpdate: fetchTherapists };

    switch(page) {
      case 'home': return <HomePage {...props} />;
      case 'services': return <ServicesPage {...props} />;
      case 'book': return <BookingPage {...props} />;
      case 'login': return <LoginPage onLogin={handleLogin} navigate={navigate} />;
      case 'signup': return <SignUpPage onSignUp={handleLogin} />;
      case 'myReservations': return <CustomerReservationsPage {...props} />;
      case 'forgotPassword': return <ForgotPasswordPage />;
      case 'resetPassword': return <ResetPasswordPage token={resetToken} navigate={navigate} />;
      case 'employeePortal': return <EmployeePortal {...props} />;
      case 'employerPortal': return <EmployerPortal {...props} />;
      case 'settings': return <SettingsPage {...props} />;
      default: return <HomePage {...props} />;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-pink-500">Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Header user={user} navigate={navigate} handleLogout={handleLogout} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <main className="container mx-auto px-4 sm:px-6 py-12">
        {renderPage()}
      </main>
      <Footer storeInfo={storeInfo} />
    </div>
  );
}

// --- Reusable Layout Components ---
const Header = ({ user, navigate, handleLogout, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const NavLinks = ({ isMobile = false }) => (
    <div className={`flex ${isMobile ? 'flex-col space-y-4 items-start p-4' : 'flex-row items-center space-x-6'}`}>
      <button onClick={() => navigate('home')} className="hover:text-pink-400 transition-colors">Home</button>
      <button onClick={() => navigate('services')} className="hover:text-pink-400 transition-colors">Services</button>
      <button onClick={() => navigate('book')} className="hover:text-pink-400 transition-colors">Book Now</button>
      {user ? (
        <>
          {user.role === 'customer' && <button onClick={() => navigate('myReservations')} className="hover:text-pink-400 transition-colors">My Reservations</button>}
          {user.role === 'employee' && <button onClick={() => navigate('employeePortal')} className="hover:text-pink-400 transition-colors">Employee Portal</button>}
          {['employer', 'admin', 'frontdesk'].includes(user.role) && <button onClick={() => navigate('employerPortal')} className="hover:text-pink-400 transition-colors">Admin Portal</button>}
          <button onClick={() => navigate('settings')} className="hover:text-pink-400 transition-colors flex items-center"><Settings className="mr-1 h-4 w-4"/> Settings</button>
          <button onClick={handleLogout} className={`flex items-center text-red-500 hover:text-red-700 transition-colors`}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </button>
        </>
      ) : (
        <button onClick={() => navigate('login')} className="flex items-center bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">
          <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
        </button>
      )}
    </div>
  );
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-pink-500 cursor-pointer" onClick={() => navigate('home')}>
          Lily Spa
        </div>
        <div className="hidden md:flex">
          <NavLinks />
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      {isMobileMenuOpen && ( <div className="md:hidden bg-white py-2 border-t"> <NavLinks isMobile={true} /> </div> )}
    </header>
  );
};

const Footer = ({ storeInfo }) => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="container mx-auto px-6 py-8 text-center">
      <p>&copy; {new Date().getFullYear()} Lily Spa. All Rights Reserved.</p>
      {storeInfo?.Address && <p className="text-sm text-gray-400 mt-2">{storeInfo.Address}</p>}
    </div>
  </footer>
);
