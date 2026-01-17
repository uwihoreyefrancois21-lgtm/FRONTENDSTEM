import React from 'react';

const WhatsAppButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://wa.me/250795813936" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full p-3 inline-flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        aria-label="Chat on WhatsApp"
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.5 6.5c-1.5 0-2.9.6-4 1.5-1.1-.8-2.5-1.3-4-1.3-3.3 0-6 2.7-6 6 0 1.3.4 2.5 1.1 3.5L2 22l5.3-1.4c1 .6 2.2.9 3.4.9 3.3 0 6-2.7 6-6 0-3.3-2.7-6-6-6zm0 10.5c-.9 0-1.8-.3-2.5-.7l-.4-.2-2.5.7.7-2.4-.2-.4c-.5-.8-.7-1.7-.7-2.7 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
          <path d="M14.3 13.3c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.5.1-.1.2-.4.6-.5.8-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3 0-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 1.9 2.9 4.7 4.1.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.5-.4z"/>
        </svg>
      </a>
    </div>
  );
};

export default WhatsAppButton;
