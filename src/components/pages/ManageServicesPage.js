import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

const ManageServicesPage = ({ services: initialServices, onServicesUpdate }) => {
    const [services, setServices] = useState(initialServices);
    const [editingService, setEditingService] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', duration: '', price: '' });

    useEffect(() => {
        setServices(initialServices);
    }, [initialServices]);

    const handleEdit = (service) => {
        setEditingService(service.id);
        setFormData({ name: service.name, description: service.description, duration: service.duration, price: service.price });
    };
    
    const handleCancel = () => {
        setEditingService(null);
        setIsAdding(false);
        setFormData({ name: '', description: '', duration: '', price: '' });
    };

    const handleSave = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    duration: parseInt(formData.duration),
                    price: parseFloat(formData.price)
                })
            });
            if (!response.ok) throw new Error('Failed to update service.');
            const updatedService = await response.json();
            onServicesUpdate(services.map(s => s.id === id ? updatedService : s));
            handleCancel();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleAdd = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    duration: parseInt(formData.duration),
                    price: parseFloat(formData.price)
                })
            });
            if (!response.ok) throw new Error('Failed to add service.');
            const newService = await response.json();
            onServicesUpdate([...services, newService]);
            handleCancel();
        } catch (error) {
            alert(error.message);
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/services/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete service.');
            onServicesUpdate(services.filter(s => s.id !== id));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const renderForm = (isNew = false) => (
        <div className="bg-pink-50 p-4 rounded-lg my-4 space-y-3">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Service Name" className="w-full p-2 border rounded"/>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full p-2 border rounded"/>
            <div className="grid grid-cols-2 gap-4">
                <input name="duration" type="number" value={formData.duration} onChange={handleInputChange} placeholder="Duration (mins)" className="w-full p-2 border rounded"/>
                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} placeholder="Price" className="w-full p-2 border rounded"/>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={handleCancel} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
                <button onClick={isNew ? handleAdd : () => handleSave(editingService)} className="bg-green-500 text-white px-4 py-1 rounded">Save</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-center">Manage Services</h3>
                <button onClick={() => { setIsAdding(true); setEditingService(null); }} className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-pink-600">
                    <PlusCircle className="mr-2"/> Add Service
                </button>
            </div>
            {isAdding && renderForm(true)}
            <div className="space-y-4">
                {services.map(service => (
                    editingService === service.id ? renderForm() : (
                    <div key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.duration} mins - ${service.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700 p-2"><Edit/></button>
                            <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2/></button>
                        </div>
                    </div>
                )))}
            </div>
        </div>
    );
};

export default ManageServicesPage;