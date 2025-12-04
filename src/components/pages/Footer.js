import React from 'react';

const Footer = ({ storeInfo }) => (
  <footer className="bg-gray-800 text-white mt-12">
    <div className="container mx-auto px-6 py-8 text-center">
      <p>&copy; {new Date().getFullYear()} Lily Spa. All Rights Reserved.</p>
      {storeInfo?.Address && <p className="text-sm text-gray-400 mt-2">{storeInfo.Address}</p>}
    </div>
  </footer>
);

export default Footer;