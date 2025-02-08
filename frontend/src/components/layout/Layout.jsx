import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-primary">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
            { children }
        </main>
    </div>
  )
}

export default Layout