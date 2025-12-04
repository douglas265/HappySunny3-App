import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function EmployerPortal({ user, services, therapists, storeInfo, onServicesUpdate, onUsersUpdate }) {
    const [activeTab, setActiveTab] = useState('allReservations');
    
    const isAdmin = user.role === 'employer' || user.role === 'admin';

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-bold text-center mb-4">
                {isAdmin ? 'Admin Portal' : 'Front Desk Portal'}
            </h2>
            <p className="text-center text-lg text-gray-600 mb-8">Welcome, {user?.name}!</p>
            
            <div className="flex justify-center border-b mb-8 flex-wrap">
                <button 
                    onClick={() => setActiveTab('allReservations')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'allReservations' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                >
                    All Reservations
                </button>
                <button 
                    onClick={() => setActiveTab('customReservation')}
                    className={`px-6 py-3 font-semibold ${activeTab === 'customReservation' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                >
                    Custom Reservation
                </button>
                {isAdmin && (
                    <>
                        <button 
                            onClick={() => setActiveTab('manageServices')}
                            className={`px-6 py-3 font-semibold ${activeTab === 'manageServices' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                        >
                            Manage Services
                        </button>
                        <button 
                            onClick={() => setActiveTab('manageUsers')}
                            className={`px-6 py-3 font-semibold ${activeTab === 'manageUsers' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
                        >
                            Manage Users
                        </button>
                    </>
                )}
            </div>

            <div>
                {activeTab === 'allReservations' && <AllReservationsCalendar therapists={therapists} />}
                {activeTab === 'customReservation' && <CustomReservationForm services={services} therapists={therapists} />}
                {isAdmin && activeTab === 'manageServices' && <ManageServicesPage services={services} onServicesUpdate={onServicesUpdate} />}
                {isAdmin && activeTab === 'manageUsers' && <ManageUsersPage user={user} onUsersUpdate={onUsersUpdate} services={services} />}
            </div>
        </div>
    );
}

export default EmployerPortal;