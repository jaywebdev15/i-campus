import { createContext, useEffect, useState } from "react";

import { BiCheckCircle, BiErrorCircle, BiInfoCircle } from "react-icons/bi";

export const FlashMessageContext = createContext();

const FlashMessageProvider = ({ children }) => {
  const [flashMessage, setFlashMessage] = useState({status: "", message: ""});
  const [modalMessage, setModalMessage] = useState(false);

  const showFlashMessage = (status, message) => {
    setFlashMessage({ status: status, message: message });
    setModalMessage(true);
  }

  useEffect(() => {
    // Auto-hide after 3 seconds for better UX
    if (modalMessage) {
      const timer = setTimeout(() => setModalMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [modalMessage])

  // Determine icon and color based on status
  const getStatusStyles = () => {
    switch (flashMessage.status) {
      case "success":
        return {
          border: "border-green-500",
          itemColor: "text-green-500",
          bg: "bg-green-50",
          icon: <BiCheckCircle size={24} />
        };
      case "failed":
      case "error":
        return {
          border: "border-red-500",
          itemColor: "text-red-500",
          bg: "bg-red-50",
          icon: <BiErrorCircle size={24} />
        };
      default:
        return {
          border: "border-blue-500",
          itemColor: "text-blue-500",
          bg: "bg-blue-50",
          icon: <BiInfoCircle size={24} />
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <FlashMessageContext.Provider value={{ setFlashMessage, setModalMessage, showFlashMessage }}>
      { children }
      
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 ease-out transform
                      ${modalMessage ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        
        <div className={`flex items-center gap-4 px-6 py-4 rounded-lg shadow-2xl bg-white border-l-4 min-w-[320px] max-w-md
                        ${styles.border}`}>
            
            <div className={`${styles.itemColor} shrink-0`}>
                {styles.icon}
            </div>

            <div className="flex-1">
                <h4 className={`font-bold text-sm uppercase mb-0.5 ${styles.itemColor}`}>
                  {flashMessage.status === 'failed' ? 'Error' : flashMessage.status || 'Info'}
                </h4>
                <p className="text-gray-600 text-sm font-medium leading-tight">
                  {typeof flashMessage.message === 'object' ? JSON.stringify(flashMessage.message) : flashMessage.message}
                </p>
            </div>

            <button onClick={() => setModalMessage(false)} 
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>

    </FlashMessageContext.Provider>
  )
}

export default FlashMessageProvider