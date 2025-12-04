import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LogIn, LogOut, Menu, X, Settings, Sparkles, Calendar, Heart, Scissors, Droplet, Clock, User, DollarSign, Check, ChevronLeft, ChevronRight, Mail, KeyRound, UserPlus, Tag, XCircle, Save, Info, MapPin, Edit, Trash2, PlusCircle, Wrench } from 'lucide-react';

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

export default HomePage;