import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

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

export default EmployeePortal;