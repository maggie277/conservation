import React, { useEffect } from 'react';

const TidioChat = () => {
  useEffect(() => {
    if (window.tidioChatApi) {
      return; // Tidio already loaded
    }

    const script = document.createElement('script');
    script.src = '//code.tidio.co/7i9iuqgtp922cnaeyhujcng3z3los1ob.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default TidioChat;