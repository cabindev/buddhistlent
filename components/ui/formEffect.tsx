// components/ui/formEffect.tsx

'use client';

import { useEffect } from 'react';
import Image from 'next/image';


const FormEffect = () => {
  useEffect(() => {
    const rightLogo = document.getElementById('x-right');
    const leftLogo = document.getElementById('x-left');
    if (rightLogo && leftLogo) {
      rightLogo.style.animation = `moveRight 2s forwards`;
      leftLogo.style.animation = `moveLeft 2s forwards`;
    }
  }, []);

  return (
    <div className="flex justify-center items-center relative h-32 md:h-40 lg:h-48">
      <Image
        id="x-left"
        src="/x-left.png"
        alt="Left Logo"
        width={150}
        height={150}
        className="absolute"
      />
      <Image
        id="x-center"
        src="/x-center.png"
        alt="Center Logo"
        width={100}
        height={100}
        className="z-20"
      />
      <Image
        id="x-right"
        src="/x-right.png"
        alt="Right Logo"
        width={150}
        height={150}
        className="absolute"
      />
    </div>
  );
};

export default FormEffect;
