import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, Shield, Clock, Zap, ArrowLeft, Target, Rocket, Crown, Cross, X, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingPageProps {
    onNavigate: (screen: string, data?: any) => void;
}

type Region = 'India' | 'United States' | 'Europe' | 'Rest of World';
const REGIONS: Region[] = ['India', 'United States', 'Europe', 'Rest of World'];

interface TierFeature {
    text: string;
    bold?: boolean;
    enabled?: boolean;
    exclusive?: boolean;
}

interface PricingTier {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    description: string;
    features: TierFeature[];
    icon: React.ReactNode;
    buttonText: string;
    isFree?: boolean;
    isPopular?: boolean;
    isBestValue?: boolean;
    bgIcon: string;
    borderColor: string;
    buttonStyle: string;
}

const PRICING: Record<'india' | 'international', { symbol: string; starter: number; pro: number; elite: number }> = {
    india: { symbol: '₹', starter: 0, pro: 500, elite: 1500 },
    international: { symbol: '$', starter: 0, pro: 9, elite: 29 },
};

export function PricingPage({ onNavigate }: PricingPageProps) {
    const [region, setRegion] = useState<Region>('India');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isIndia = region === 'India';
    const pricing = isIndia ? PRICING.india : PRICING.international;
    const { symbol } = pricing;

    const getPrice = (price: number) => {
        if (price === 0) return 0;
        return billingCycle === 'yearly' ? Math.round(price * 0.8) : price;
    };

    // To unify the styling with the requested format, we define tiers here
    const tiers: PricingTier[] = [
        {
            id: 'starter',
            name: 'Starter',
            price: getPrice(pricing.starter),
            originalPrice: pricing.starter,
            description: "Perfect for getting started",
            features: [
                { text: '15 Credits / month', bold: true },
                { text: 'Standard Analysis' },
                { text: 'Unlimited Audits', enabled: false },
                { text: 'Download Reports', enabled: false },
                // Dummy spacing features to help align if needed, but flex-grow handles it.
            ],
            icon: <Zap className="w-6 h-6 text-slate-400" />,
            buttonText: 'Current Plan',
            isFree: true,
            isPopular: false,
            bgIcon: 'bg-slate-100',
            borderColor: 'border-slate-100',
            buttonStyle: 'bg-slate-50 text-slate-400 cursor-default',
        },
        {
            id: 'pro',
            name: 'Pro',
            price: getPrice(pricing.pro),
            originalPrice: pricing.pro,
            description: "Best for growing teams",
            features: [
                { text: 'Unlimited Audits', bold: true },
                { text: 'Priority Processing' },
                { text: 'Premium Expert Personas', bold: true },
                { text: 'Full History Access' },
                { text: 'Advanced Heatmaps' },
            ],
            // Use standard Tailwind colors for reliability
            icon: <Rocket className="w-6 h-6 text-blue-600" />,
            buttonText: 'Upgrade to Pro',
            isPopular: true,
            bgIcon: 'bg-blue-600/10',
            borderColor: 'border-blue-600',
            buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20',
        },
        {
            id: 'elite',
            name: 'Elite',
            price: getPrice(pricing.elite),
            originalPrice: pricing.elite,
            description: "Maximum power & support",
            features: [
                { text: 'Unlimited Design Audits' },
                { text: 'Custom Audit Criteria' },
                { text: 'Team Collaboration' },
                { text: 'White-label Reports', exclusive: true, bold: true },
                { text: '24/7 Priority Support' },
            ],
            // Use inline style to force the color since Tailwind class was failing
            icon: <Crown className="w-6 h-6" style={{ color: '#f59e0b' }} />,
            buttonText: 'Upgrade to Elite',
            isBestValue: true,
            bgIcon: '', // Handled via style inside map loop
            borderColor: 'border-slate-100',
            buttonStyle: 'bg-slate-900 hover:bg-black text-white',
        }
    ];

    // Selected logic for styling default
    const selectedTierId = 'pro';

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center pt-20 pb-32 px-6 overflow-x-hidden font-['Inter',_'Helvetica_Neue',_Helvetica,_Arial,_sans-serif]">

            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* Header Section */}
            <div className="w-full max-w-4xl text-center mb-16 mt-8 relative z-10">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-[14px] flex items-center justify-center shadow-xl rotate-[-2deg] mb-4">
                        <Target className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">Pricing.</h1>
                </div>

                {/* Region & Toggle Controls */}
                <div className="flex flex-col items-center gap-6 mb-8">
                    {/* Region Dropdown */}
                    <div className="relative z-50">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all text-xs font-bold text-slate-600 cursor-pointer uppercase tracking-wider"
                        >
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            {region}
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50"
                                >
                                    {REGIONS.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => { setRegion(r); setDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${region === r
                                                ? 'bg-blue-600/5 text-blue-600'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Billing Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center relative">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`relative z-10 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`relative z-10 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Yearly <span className="text-[9px] text-green-600 ml-1.5">-20%</span>
                        </button>
                    </div>
                </div>

                <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
                    Choose the plan that fits your design workflow. Upgrade or cancel anytime.
                </p>
            </div>

            {/* Pricing Cards Grid */}
            {/* Ensure grid items stretch to match height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12 items-stretch">
                {tiers.map((tier) => (
                    <motion.div
                        key={tier.id}
                        whileHover={{ y: -8 }}
                        className="flex flex-col relative h-full"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Badges */}
                        {tier.isPopular && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-blue-600 shadow-lg whitespace-nowrap">
                                MOST POPULAR
                            </div>
                        )}
                        {tier.isBestValue && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-white bg-slate-900 shadow-lg whitespace-nowrap border border-slate-700">
                                ELITE STATUS
                            </div>
                        )}

                        {/* Card Content - h-full ensures wrapper fills height, flex ensures content distribution */}
                        <div className={`p-8 h-full rounded-[40px] border-2 transition-all flex flex-col items-start gap-6 relative group ${selectedTierId === tier.id
                                ? 'border-blue-600 bg-white shadow-xl z-10'
                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm z-0'
                            }`}>
                            {/* Header */}
                            <div className="flex items-center justify-between w-full">
                                <div
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${tier.bgIcon}`}
                                    style={tier.id === 'elite' ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } : {}}
                                >
                                    {tier.icon}
                                </div>
                                {tier.id === 'starter' && (
                                    <span className="text-[10px] font-black text-green-600 bg-green-600/10 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                )}
                            </div>

                            {/* Price & Name */}
                            <div className="space-y-1 w-full">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <AnimatePresence mode='wait'>
                                        <motion.span
                                            key={`${tier.price}-${billingCycle}`}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-4xl font-black text-slate-900"
                                        >
                                            {symbol}{tier.price}
                                        </motion.span>
                                    </AnimatePresence>
                                    {!tier.isFree && <span className="text-sm font-bold text-slate-400">/mo</span>}
                                </div>
                                {billingCycle === 'yearly' && !tier.isFree && (
                                    <div className="text-xs text-slate-400 line-through decoration-slate-300">
                                        {symbol}{tier.originalPrice}
                                    </div>
                                )}
                            </div>

                            {/* Features List - Flex Grow handles gap logic */}
                            <div className="w-full space-y-4 flex-grow pt-2">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className={`flex items-start gap-3 ${feature.enabled === false ? 'opacity-50 grayscale' : ''}`}>
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${feature.enabled === false ? 'bg-slate-100' : 'bg-slate-50'
                                            }`}>
                                            {feature.enabled === false
                                                ? <X className="w-3 h-3 text-slate-400" />
                                                : <Check className="w-3 h-3 text-slate-900" />
                                            }
                                        </div>
                                        <span className={`text-sm font-medium ${feature.bold ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Button - mt-auto enforces bottom alignment if flex-grow fails */}
                            <button
                                className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 mt-auto ${tier.buttonStyle}`}
                            >
                                {tier.buttonText}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Trust Badges Section */}
            <div className="w-full max-w-3xl flex flex-col items-center gap-12">
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-slate-400 font-bold">
                    <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Secure via Stripe</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Instant Activation</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">Cancel Anytime</span>
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
                    Questions about our enterprise plan? <span className="text-blue-600 cursor-pointer hover:underline">Contact our sales team</span> for custom integrations and volume discounts.
                </p>
            </div>

            {/* Brand Logos */}
            <div className="mt-24 max-w-4xl w-full select-none pointer-events-none">
                <div className="flex flex-wrap items-center justify-center gap-12 opacity-20 grayscale contrast-125">
                    <div className="font-black text-xl tracking-tighter italic text-slate-900">STRIPE</div>
                    <div className="font-black text-xl tracking-tighter italic text-slate-900">VERCEL</div>
                    <div className="font-black text-xl tracking-tighter italic text-slate-900">LINEAR</div>
                    <div className="font-black text-xl tracking-tighter italic text-slate-900">FIGMA</div>
                    <div className="font-black text-xl tracking-tighter italic text-slate-900">RAYCAST</div>
                </div>
            </div>
        </div>
    );
}
