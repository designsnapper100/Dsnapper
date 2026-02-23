import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dark' | 'light';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md', variant = 'dark', showText = true }: LogoProps) {
    // Always use the dark pill look to match the provided reference perfectly
    const bgClass = 'bg-zinc-950 text-white';

    // Scale tracking and sizing based on md standard
    const sizeConfig = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-3xl',
        xl: 'text-5xl',
    };

    const currentSize = sizeConfig[size];
    const textStr = showText ? "Design Snapper." : "Snapper.";

    return (
        <div
            className={`inline-flex items-center justify-center font-sans font-[900] tracking-tight select-none cursor-pointer ${bgClass} ${currentSize} ${className}`}
            style={{
                borderRadius: '0.4em',
                padding: '0.2rem 0.5em',
                lineHeight: '1.1', // slightly above 1 to accommodate p descenders naturally
            }}
        >
            {textStr}
        </div>
    );
}
