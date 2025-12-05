import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';
import { API_URL } from '../../api';

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

  export default ServicesPage;