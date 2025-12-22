import React, { useState } from 'react';
import { Card, Button, Typography, Loader, useToast } from '@welovejeff/movers-react';
import { authService } from '../services/authService';

interface LoginScreenProps {
    onLoginSuccess: (accessToken: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast, ToastContainer } = useToast();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const { accessToken } = await authService.signInWithGoogle();
            onLoginSuccess(accessToken);
        } catch (error: any) {
            console.error(error);
            // Display friendly error for domain restriction
            if (error.message.includes('Access Restricted')) {
                toast.error('Access Denied: @moversshakers.co email required.');
            } else {
                toast.error('Login failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            padding: '1rem'
        }}>
            <Card style={{
                maxWidth: '400px',
                width: '100%',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                borderWidth: '3px',
                boxShadow: '8px 8px 0px #000'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Typography variant="h2" style={{ marginBottom: '0.5rem' }}>
                        MOVERS+SHAKERS
                    </Typography>
                    <Typography variant="h4" style={{ background: '#FFF000', display: 'inline-block', padding: '0 0.5rem' }}>
                        CRM AGENT
                    </Typography>
                </div>

                <div style={{ textAlign: 'center', color: '#666' }}>
                    <Typography variant="body1">
                        Please sign in with your company email to access the CRM.
                    </Typography>
                </div>

                <Button
                    variant="primary"
                    onClick={handleLogin}
                    disabled={isLoading}
                    style={{ width: '100%', justifyContent: 'center', height: '50px' }}
                >
                    {isLoading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Loader size="small" /> Signing in...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="G"
                                style={{ width: '20px', height: '20px' }}
                            />
                            Sign in with Google
                        </span>
                    )}
                </Button>

                <Typography variant="caption" style={{ color: '#999', marginTop: '1rem' }}>
                    Restricted to @moversshakers.co
                </Typography>
            </Card>
            <ToastContainer />
        </div>
    );
};

export default LoginScreen;
