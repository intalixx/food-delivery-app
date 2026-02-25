import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
    id: string;
    user_name: string;
    mobile_number: string;
    email?: string;
    gender?: string;
    image_path?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('auth_token');
            if (token) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                        setUser(data.data);
                    } else {
                        Cookies.remove('auth_token');
                    }
                } catch (error) {
                    console.error('Failed to load user session', error);
                }
            }
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const login = (userData: User, token: string) => {
        setUser(userData);
        Cookies.set('auth_token', token, { expires: 7 });
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('auth_token');
        Cookies.remove('jwt'); // Optional cleanup if frontend set it
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
