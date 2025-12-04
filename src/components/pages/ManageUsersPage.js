import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

function ManageUsersPage({ user: adminUser, onUsersUpdate, services }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [editingUser, setEditingUser] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', userRole: 'employee', password: '' });
    
    const [managingServicesFor, setManagingServicesFor] = useState(null);
    const [employeeServices, setEmployeeServices] = useState(new Set());

    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
             const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch users.');
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleEdit = (user) => {
        setEditingUser(user.id);
        setFormData({ fullName: user.FullName, email: user.Email, phoneNumber: user.PhoneNumber, userRole: user.UserRole, password: '' });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setIsAdding(false);
        setFormData({ fullName: '', email: '', phoneNumber: '', userRole: 'employee', password: '' });
    };

    const handleSave = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    userRole: formData.userRole
                })
            });
             const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update user.');
            await fetchUsers();
            onUsersUpdate();
            handleCancel();
        } catch (error) {
            alert(error.message);
        }
    };
    
    const handleAdd = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
             const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to add user.');
            await fetchUsers();
            onUsersUpdate();
            handleCancel();
        } catch (error) {
            alert(error.message);
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
             const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to delete user.');
            await fetchUsers();
            onUsersUpdate();
        } catch (error) {
            alert(error.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const openServiceManager = async (employee) => {
        if (employee.UserRole !== 'employee') return;
        setManagingServicesFor(employee);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/employees/${employee.InternalUserID}/services`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setEmployeeServices(new Set(data));
        } catch (error) {
            console.error("Failed to fetch employee services", error);
        }
    };
    
    const handleServiceToggle = (serviceId) => {
        setEmployeeServices(prev => {
            const newServices = new Set(prev);
            if (newServices.has(serviceId)) newServices.delete(serviceId);
            else newServices.add(serviceId);
            return newServices;
        });
    };

    const handleSaveEmployeeServices = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/employees/${managingServicesFor.InternalUserID}/services`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ serviceIds: Array.from(employeeServices) }),
            });
            setManagingServicesFor(null);
        } catch (error) {
            alert('Failed to save services.');
        }
    };
    
    const renderForm = (isNew = false) => (
        <div className="bg-pink-50 p-4 rounded-lg my-4 space-y-3">
            <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" className="w-full p-2 border rounded"/>
            <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full p-2 border rounded"/>
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" className="w-full p-2 border rounded"/>
            <select name="userRole" value={formData.userRole} onChange={handleInputChange} className="w-full p-2 border rounded">
                <option value="customer">Customer</option>
                <option value="employee">Employee</option>
                <option value="frontdesk">Front Desk</option>
                <option value="admin">Admin</option>
                <option value="employer">Employer</option>
            </select>
            {isNew && <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Password" className="w-full p-2 border rounded"/>}
            <div className="flex justify-end gap-2">
                <button onClick={handleCancel} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
                <button onClick={isNew ? handleAdd : () => handleSave(editingUser)} className="bg-green-500 text-white px-4 py-1 rounded">Save</button>
            </div>
        </div>
    );
    
    const filteredUsers = users.filter(u => roleFilter === 'all' || u.UserRole === roleFilter);

    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">Manage Users</h3>
                <div className="flex items-center gap-4">
                     <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="p-2 border rounded-lg">
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="employee">Employees</option>
                        <option value="admin">Admins</option>
                        <option value="employer">Employers</option>
                        <option value="frontdesk">Front Desk</option>
                    </select>
                    <button onClick={() => setIsAdding(true)} className="bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-pink-600">
                        <UserPlus className="mr-2"/> Add User
                    </button>
                </div>
            </div>
            {isAdding && renderForm(true)}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            editingUser === user.id ? (
                                <tr key={user.id}><td colSpan="5">{renderForm()}</td></tr>
                            ) : (
                            <tr key={user.id} className="border-b">
                                <td className="p-2">{user.FullName}</td>
                                <td className="p-2">{user.Email}</td>
                                <td className="p-2">{user.PhoneNumber}</td>
                                <td className="p-2 capitalize">{user.UserRole}</td>
                                <td className="p-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18}/></button>
                                        {adminUser.id !== user.id && <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button>}
                                        {user.UserRole === 'employee' && (
                                            <button onClick={() => openServiceManager(user)} className="text-green-600 hover:text-green-800 p-1" title="Manage Services">
                                                <Wrench size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>

            {managingServicesFor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Manage Services for {managingServicesFor.FullName}</h3>
                        <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                            {services.map(service => (
                                <label key={service.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={employeeServices.has(service.id)}
                                        onChange={() => handleServiceToggle(service.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                    />
                                    <span>{service.name}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setManagingServicesFor(null)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button>
                            <button onClick={handleSaveEmployeeServices} className="bg-pink-500 text-white px-4 py-2 rounded-lg">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsersPage;