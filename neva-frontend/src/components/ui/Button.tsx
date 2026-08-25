'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'wipe' | 'cyan' | 'violet' | 'solid';
  icon?: React.ReactNode;
}

export default function Button({
  children,
  className = '',
  variant = 'wipe',
  icon,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  if (variant === 'cyan') {
    return (
      <button
        type={type}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
        {...props}
        className={`group/btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-black uppercase tracking-wider shadow-xs transition-all duration-300 active:scale-95 cursor-pointer hover:border-cyan-500 hover:text-white ${className}`}
      >
        {/* Left to Right Color Fill Overlay */}
        <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-500 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
        <span className="relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-300">
          {icon}
          {children}
        </span>
      </button>
    );
  }

  if (variant === 'violet') {
    return (
      <button
        type={type}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(e);
        }}
        {...props}
        className={`group/btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-violet-600 bg-violet-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-violet-600/20 transition-all duration-300 active:scale-95 cursor-pointer hover:border-violet-500 ${className}`}
      >
        {/* Left to Right Color Fill Overlay */}
        <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-indigo-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
        <span className="relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-300">
          {icon}
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      {...props}
      className={`
        group/btn
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-violet-600
        hover:bg-violet-500
        active:scale-95
        text-white
        font-bold
        text-xs
        py-2.5
        px-4
        transition-all
        duration-300
        shadow-md
        cursor-pointer
        ${className}
      `}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 w-0 group-hover/btn:w-full transition-all duration-500 ease-out z-0" />
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
    </button>
  );
}

export { Button as ColorWipeButton };