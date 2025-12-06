import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight, Save, Wrench } from 'lucide-react';
import { API_URL } from '../../api';

// Helper for 24-hour time formatting (HH:MM)
const formatTime24h = (hours, minutes) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// --- StoreHoursEditor Component ---
function StoreHoursEditor({ user, storeInfo }) {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [schedule, setSchedule] = useState({}); // { 'YYYY-MM-DD': { start: 'HH:MM', end: 'HH:MM' } }
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Time Slot Generation ---
    const timeSlots = useMemo(() => {
        // Generates 30-minute slots from 00:00 to 23:30
        const slots = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                slots.push(formatTime24h(h, m));
            }
        }
        return slots;
    }, []);

    // Helper to extract HH:MM from DB format (e.g., "09:00:00.0000000" -> "09:00")
    const getBaseTime = (dbTimeString) => dbTimeString ? dbTimeString.substring(0, 5) : '';

    const defaultStartTime = useMemo(() => getBaseTime(storeInfo?.OpeningTime), [storeInfo]);
    const defaultEndTime = useMemo(() => getBaseTime(storeInfo?.ClosingTime), [storeInfo]);

    // --- Date Calculation ---
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentWeek);
        // Set to the first day of the week (Sunday = 0)
        startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
        
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
    }, [currentWeek]);

    // Calculate all dates for the next month (4 weeks) for pre-fetching/generation
    const getMonthDates = useCallback((startDate) => {
        const dates = new Set();
        let currentDate = new Date(startDate);
        // Move to the start of the current week
        currentDate.setDate(currentDate.getDate() - currentDate.getDay());
        
        for (let i = 0; i < 28; i++) { // 4 weeks
            const dateStr = currentDate.toISOString().split('T')[0];
            dates.add(dateStr);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return Array.from(dates);
    }, []);

    // --- Fetch Schedule ---
    const fetchSchedule = useCallback(async (datesToFetch) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const dateQuery = datesToFetch.join(',');

        try {
            // Note: Assuming a backend endpoint to fetch store hours for multiple dates
            const response = await fetch(`${API_URL}/storeschedule?dates=${dateQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // FIX: Check if response is JSON content type before parsing
            const contentType = response.headers.get("content-type");
            const isJson = contentType && contentType.indexOf("application/json") !== -1;
            
            let data = {};
            if (isJson) {
                data = await response.json();
            } else if (!response.ok) {
                 // Handle non-JSON server error (e.g., 500 status with plain text/HTML body)
                const text = await response.text();
                throw new Error(`Server returned status ${response.status}: ${text.substring(0, 50)}...`);
            } else {
                // If it's a success status but no JSON (e.g., 204 No Content), treat data as empty
                data = [];
            }
            
            if (!response.ok && isJson) throw new Error(data.message || 'Failed to fetch store schedule.');
            
            // Map the fetched schedule (which might be sparse)
            const fetchedSchedule = data.reduce((acc, entry) => {
                acc[entry.date] = { start: getBaseTime(entry.start), end: getBaseTime(entry.end) };
                return acc;
            }, {});

            // Auto-generate missing weeks using default times (Next 4 weeks)
            const generatedSchedule = {};
            const startDate = new Date(currentWeek);
            startDate.setDate(startDate.getDate() - startDate.getDay());

            for (let i = 0; i < 28; i++) { // Generate 4 weeks (28 days)
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                // If schedule exists in fetched data, use it. Otherwise, use defaults.
                generatedSchedule[dateStr] = fetchedSchedule[dateStr] || {
                    start: defaultStartTime,
                    end: defaultEndTime
                };
            }

            setSchedule(generatedSchedule);
        } catch (error) {
            console.error("Error fetching schedule:", error);
            setMessage(`Error fetching schedule: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [defaultStartTime, defaultEndTime, currentWeek]);

    useEffect(() => {
        const datesToFetch = getMonthDates(currentWeek);
        fetchSchedule(datesToFetch);
    }, [currentWeek, fetchSchedule, getMonthDates]);

    // --- Handlers ---
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

        // 1. Validation (only checking the current visible week for simplicity)
        for (const day of weekDays) {
            const dateStr = day.toISOString().split('T')[0];
            const daySchedule = schedule[dateStr] || {}; 
            
            // Access properties safely on daySchedule, which is now guaranteed to be an object
            if (daySchedule.start && daySchedule.end && daySchedule.start >= daySchedule.end) {
                setMessage(`Error: End time must be after start time for ${dateStr}.`);
                return;
            }
        }
        
        // 2. Prepare data for the visible week
        const scheduleToSave = weekDays.map(day => {
            const dateStr = day.toISOString().split('T')[0];
            const daySchedule = schedule[dateStr] || {}; 
            return {
                date: dateStr,
                start: daySchedule.start || null, 
                end: daySchedule.end || null      
            };
        });

        try {
            // Note: Assuming a backend endpoint for saving/updating store hours
            const response = await fetch(`${API_URL}/storeschedule`, {
                method: 'POST', // Use POST/PUT depending on API design; POST used for bulk upsert
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(scheduleToSave),
            });
            
            // FIX: Check if response is JSON content type before parsing
            const contentType = response.headers.get("content-type");
            const isJson = contentType && contentType.indexOf("application/json") !== -1;

            let data = {};
            if (isJson) {
                data = await response.json();
            } else if (!response.ok) {
                // Handle non-JSON server error (e.g., 404, 500 status with plain text/HTML body)
                const text = await response.text();
                throw new Error(`Server returned status ${response.status}: ${text.substring(0, 50)}...`);
            }
            
            if (!response.ok && isJson) throw new Error(data.message || 'Failed to save store schedule.');
            
            setMessage('Store Hours saved successfully!');
            setTimeout(() => setMessage(''), 3000);
            
            // Re-fetch to ensure the state is fully synchronized, especially for other weeks
            const datesToFetch = getMonthDates(currentWeek);
            fetchSchedule(datesToFetch);
        } catch (error) {
            setMessage(`Error saving schedule: ${error.message}`);
        }
    };

    const changeWeek = (direction) => {
        setCurrentWeek(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };

    if (!user || (!['employer', 'admin'].includes(user.role))) {
        return <p className="text-red-500 text-center">Access denied. Only Employers and Admins can view this page.</p>;
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
            <h3 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center">
                <Wrench className="mr-2 h-6 w-6 text-pink-500" /> Store Operating Hours Editor
            </h3>
            <p className="text-center text-gray-500 mb-4">Default Hours: {defaultStartTime || 'N/A'} - {defaultEndTime || 'N/A'}</p>
            
            {/* Week Navigation */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                <span className="font-semibold">{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
            </div>
            
            {isLoading ? (
                <p className="text-center py-8">Loading store schedule...</p>
            ) : (
                <div className="space-y-4">
                    {weekDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        // Use default empty object if the schedule key doesn't exist yet
                        const daySchedule = schedule[dateStr] || {}; 
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0)); // Check if day is in the past
                        
                        return (
                            <div key={dateStr} className={`grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-3 rounded-lg ${isPast ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                <div className="font-semibold text-center md:text-left">
                                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    {isPast && <span className="text-xs text-gray-400 ml-2">(Past)</span>}
                                </div>
                                
                                {/* Start Time Select */}
                                <select 
                                    value={daySchedule.start || ''} 
                                    onChange={e => handleTimeChange(day, 'start', e.target.value)} 
                                    className="p-2 border rounded-lg w-full"
                                    disabled={isPast}
                                >
                                    <option value="">Closed (Start)</option>
                                    {timeSlots.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
                                </select>
                                
                                {/* End Time Select */}
                                <select 
                                    value={daySchedule.end || ''} 
                                    onChange={e => handleTimeChange(day, 'end', e.target.value)} 
                                    className="p-2 border rounded-lg w-full"
                                    disabled={isPast}
                                >
                                    <option value="">Closed (End)</option>
                                    {timeSlots.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
                                </select>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className="text-center mt-6">
                <button onClick={handleSave} 
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center mx-auto disabled:opacity-50"
                    disabled={isLoading}
                >
                    <Save className="mr-2 h-5 w-5"/> Save This Week's Hours
                </button>
                {message && <p className={`mt-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            </div>
        </div>
    );
}

export default StoreHoursEditor;