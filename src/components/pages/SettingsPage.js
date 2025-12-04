import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

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

export default SettingsPage;