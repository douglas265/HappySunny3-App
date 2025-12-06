import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';
import { API_URL } from '../../api';


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

export default EmployeeServicesManager;