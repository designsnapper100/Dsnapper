import logoUrl from '../assets/logo-image.png';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'dark' | 'light';
    showText?: boolean;
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
    const sizeConfig = {
        sm: 'h-6',
        md: 'h-8',
        lg: 'h-10',
        xl: 'h-12',
    };

    const currentHeight = sizeConfig[size];

    return (
        <div className={`flex items-center ${className}`}>
            <img
                src={logoUrl}
                alt="Design Snapper Logo"
                className={`${currentHeight} w-auto object-contain shrink-0 drop-shadow-sm`}
            />
        </div>
    );
}
