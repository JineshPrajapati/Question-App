import { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(mobileQuery.matches);
    updateIsMobile();

    mobileQuery.addEventListener('change', updateIsMobile);

    return () => mobileQuery.removeEventListener('change', updateIsMobile);
  }, []);

  return isMobile;
}

export default useIsMobile;
