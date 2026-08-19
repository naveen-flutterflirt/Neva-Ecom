'use client';

import React from 'react';

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-[linear-gradient(90deg,#2E3192_0%,#1BFFFF_100%)]
        hover:bg-[linear-gradient(90deg,#252879_0%,#16DCDC_100%)]
        active:scale-95
        text-white
        font-bold
        text-sm
        py-4
        transition-all
        duration-200
        shadow-lg
        shadow-violet-600/10
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  );
}