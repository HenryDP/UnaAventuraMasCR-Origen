import React from 'react';
import { useWhatsApp } from '../context/WhatsAppContext';

// Replace with the actual phone number
const PHONE_NUMBER = "50687751442"; 

export default function WhatsAppButton() {
  const { message } = useWhatsApp();

const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = https://wa.me/50687751442?text=${encodedMessage};
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Contactar por WhatsApp"
    >
      <svg 
        viewBox="0 0 24 24" 
        width="32" 
        height="32" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="fill-white stroke-none"
      >
        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.07 0C5.537 0 .181 5.37.175 11.964c0 2.1.546 4.156 1.598 5.945L.53 23.681l6.002-1.575a11.817 11.817 0 005.538 1.348h.001c6.536 0 11.894-5.369 11.9-11.963a11.812 11.812 0 00-3.464-8.432z" />
      </svg>
      
      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 bg-white text-stone-800 text-sm py-1 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
        ¡Chatea con nosotros!
      </span>
    </button>
  );
}
