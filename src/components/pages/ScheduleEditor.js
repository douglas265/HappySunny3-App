import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

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

export default ScheduleEditor;