import { useState, FormEvent } from 'react';
import { supabase } from '../utils/supabase/client';
import { Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from './Logo';

interface CompleteProfilePageProps {
    onNavigate: (screen: string, data?: any) => void;
}

export function CompleteProfilePage({ onNavigate }: CompleteProfilePageProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCompleteProfile = async (e: FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (username.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }

        setLoading(true);

        try {
            // Update the user with new metadata and password
            const { error } = await supabase.auth.updateUser({
                password: password,
                data: {
                    username: username,
                    full_name: username // Optional: set full_name to username if not present
                }
            });

            if (error) throw error;

            toast.success("Profile updated successfully!");
            // Redirect to upload page (or wherever the main app flow starts)
            onNavigate('upload');

        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#FAFBFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            padding: '24px',
        }}>
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 40,
            }}>
                <Logo size="xl" />
            </div>

            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: 440,
                background: 'white',
                borderRadius: 28,
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.08)',
                padding: '48px 44px',
                border: '1px solid rgba(226,232,240,0.6)',
            }}>
                <div style={{ marginBottom: 36 }}>
                    <h1 style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: 8,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                    }}>
                        Complete Your Profile
                    </h1>
                    <p style={{
                        fontSize: 14,
                        color: '#94a3b8',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        margin: 0,
                    }}>
                        Set a username and password to secure your account and enable email login.
                    </p>
                </div>

                <form onSubmit={handleCompleteProfile}>
                    {/* Username */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 8,
                        }}>Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="johndoe"
                            style={{
                                width: '100%',
                                height: 48,
                                padding: '0 16px',
                                background: '#f8fafc',
                                border: '1px solid transparent',
                                borderRadius: 12,
                                fontSize: 14,
                                color: '#0F172A',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                            onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 8,
                        }}>New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            style={{
                                width: '100%',
                                height: 48,
                                padding: '0 16px',
                                background: '#f8fafc',
                                border: '1px solid transparent',
                                borderRadius: 12,
                                fontSize: 14,
                                color: '#0F172A',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                letterSpacing: '0.15em',
                            }}
                            onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                            onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: 28 }}>
                        <label style={{
                            display: 'block',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 8,
                        }}>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            minLength={6}
                            style={{
                                width: '100%',
                                height: 48,
                                padding: '0 16px',
                                background: '#f8fafc',
                                border: '1px solid transparent',
                                borderRadius: 12,
                                fontSize: 14,
                                color: '#0F172A',
                                outline: 'none',
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                letterSpacing: '0.15em',
                            }}
                            onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.border = '1px solid #cbd5e1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,23,42,0.05)'; }}
                            onBlur={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: 48,
                            background: '#0F172A',
                            color: 'white',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                            opacity: loading ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,0.2)'; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.15)'; }}
                    >
                        {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                        Save & Continue
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
