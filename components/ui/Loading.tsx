'use client';
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed z-50 inset-0 bg-white flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Loading SVG - overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-32 h-32 flex justify-center items-center sm:w-40 sm:h-40 md:w-full md:h-[350px]">
            <div className="w-32 h-32 border-12 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            {/* <iframe className='w-full h-full' src="https://lottie.host/embed/9cc06c01-38d5-4064-9da6-4d160282d650/zrwZDRzOke.lottie"></iframe> */}
          </div>
        </div>
      </div>
    </div>
  );
}