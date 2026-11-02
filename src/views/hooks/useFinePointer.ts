import { useEffect, useState } from 'react';

export function useFinePointer() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => {
      setIsFinePointer(media.matches);
    };

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return isFinePointer;
}
