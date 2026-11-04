import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { apiService } from '../services/api';
import { Language, translations, TranslationDict } from '../i18n/translations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  fontSizeMode: 'normal' | 'large' | 'xl';
  setFontSizeMode: (mode: 'normal' | 'large' | 'xl') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    state?: string;
    district?: string;
  }) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civicos_citizen_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('civicos_citizen_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'xl'>(() => {
    return (localStorage.getItem('civicos_font_size') as 'normal' | 'large' | 'xl') || 'normal';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('civicos_language') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('civicos_language', lang);
  };

  const handleSetFontSize = (mode: 'normal' | 'large' | 'xl') => {
    setFontSizeMode(mode);
    localStorage.setItem('civicos_font_size', mode);
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('civicos_citizen_token');
    if (!storedToken) {
      setUser(null);
      return;
    }
    try {
      const profile = await apiService.getCurrentUser();
      setUser(profile);
      localStorage.setItem('civicos_citizen_user', JSON.stringify(profile));
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civicos_citizen_token');
      if (storedToken) {
        await refreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiService.login(email, password);

    localStorage.setItem('civicos_citizen_token', data.access_token);
    localStorage.setItem('civicos_citizen_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    state?: string;
    district?: string;
  }): Promise<User> => {
    const newUser = await apiService.register(payload);
    // Automatically log in after registration
    await login(payload.email, payload.password);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('civicos_citizen_token');
    localStorage.removeItem('civicos_citizen_user');
    setToken(null);
    setUser(null);
  };

  const t = translations[language] || translations.en;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        fontSizeMode,
        setFontSizeMode: handleSetFontSize,
        language,
        setLanguage: handleSetLanguage,
        t,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
