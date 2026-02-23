import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dark' | 'light';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md', variant = 'dark', showText = true }: LogoProps) {
    const isDark = variant === 'dark';
    const bgClass = isDark ? 'bg-slate-900 border border-slate-900' : 'bg-white border border-slate-200 shadow-md';
    const textClass = isDark ? 'text-white' : 'text-slate-900';

    // Scale classes for different sizes
    const sizeConfig = {
        sm: { py: 'py-0.5', px: 'px-2.5', text: 'text-[12px]' },
        md: { py: 'py-1', px: 'px-3', text: 'text-base' },
        lg: { py: 'py-2', px: 'px-5', text: 'text-2xl' },
        xl: { py: 'py-2.5', px: 'px-6', text: 'text-4xl' },
    };

    const currentSize = sizeConfig[size];
    const textStr = showText ? "design snapper." : "ds.";

    return (
        <div className={`relative inline-flex items-center justify-center cursor-pointer group ${currentSize.text} ${className}`}>
            {/* The Slanted Background Container */}
            <div
                className={`absolute inset-0 ${bgClass} -skew-x-[12deg] group-hover:-skew-x-[10deg] transition-all duration-300 ease-out origin-bottom-left`}
                style={{
                    borderTopLeftRadius: '0.15em',
                    borderTopRightRadius: '0.15em',
                    borderBottomRightRadius: '0.8em',
                    borderBottomLeftRadius: '0.15em',
                }}
            />

            {/* The Text overlay */}
            <span
                className={`relative z-10 font-['Poppins',_sans-serif] font-[900] italic ${textClass} ${currentSize.px} ${currentSize.py} tracking-tight leading-none lowercase select-none whitespace-nowrap`}
                style={{
                    // Nudge baseline for perfect optical centering
                    paddingTop: '0.25em',
                    paddingBottom: '0.15em',
                    letterSpacing: '-0.04em',
                }}
            >
                {textStr}
            </span>
        </div>
    );
}
