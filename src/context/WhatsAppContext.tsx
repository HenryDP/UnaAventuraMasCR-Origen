import React, { createContext, useState, useContext, ReactNode } from 'react';

interface WhatsAppContextType {
  message: string;
  setMessage: (msg: string) => void;
  resetMessage: () => void;
}

const DEFAULT_MESSAGE = "¡Hola! Estoy en la aplicación de Una Aventura Más Costa Rica y me gustaría información para reservar.";

const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [message, setMessageState] = useState(DEFAULT_MESSAGE);

  const setMessage = (msg: string) => {
    setMessageState(msg);
  };

  const resetMessage = () => {
    setMessageState(DEFAULT_MESSAGE);
  };

  return (
    <WhatsAppContext.Provider value={{ message, setMessage, resetMessage }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsApp() {
  const context = useContext(WhatsAppContext);
  if (context === undefined) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
}
