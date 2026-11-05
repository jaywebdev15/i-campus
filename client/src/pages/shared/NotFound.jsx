import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TbError404 } from "react-icons/tb";

const NotFound = () => {
    const navigate = useNavigate();

  return (
    <div className='bg-gray-100 min-h-screen flex flex-col justify-center items-center gap-6 p-4'>
        <div className='flex flex-col items-center text-gray-400 animate-pulse'>
            <TbError404 className='text-9xl md:text-[12rem]'/>
            <h1 className='text-2xl md:text-3xl font-bold uppercase tracking-widest text-center'>Page Not Found</h1>
        </div>
        <p className='text-gray-500 text-center max-w-md'>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className='flex gap-4'>
            <button 
                onClick={() => navigate(-1)}
                className='px-6 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium'>
                Go Back
            </button>
            <button 
                onClick={() => navigate('/')}
                className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/20'>
                Go Home
            </button>
        </div>
    </div>
  )
}

export default NotFound
