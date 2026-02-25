interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dark' | 'light';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md', variant = 'dark' }: LogoProps) {
    const sizeConfig = {
        sm: { height: 'h-6', text: 'text-sm' },
        md: { height: 'h-8', text: 'text-lg' },
        lg: { height: 'h-10', text: 'text-2xl' },
        xl: { height: 'h-14', text: 'text-3xl' },
    };

    const themeConfig = {
        dark: { filter: '', text: 'text-slate-900' },
        light: { filter: 'invert brightness-0 invert', text: 'text-white' },
    };

    const currentSize = sizeConfig[size];
    const currentTheme = themeConfig[variant];

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <img
                src="/snapper-logo.png"
                alt="Snapper"
                className={`${currentSize.height} w-auto object-contain ${currentTheme.filter}`}
            />
        </div>
    );
}
