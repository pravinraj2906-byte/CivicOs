import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { apiService } from '../services/api';
import { Language, TranslationDict, translations } from '../i18n/translations';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civicos_officer_user');
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
    return localStorage.getItem('civicos_officer_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = localStorage.getItem('civicos_officer_language');
    if (savedLang === 'ta' || savedLang === 'en') {
      return savedLang;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('civicos_officer_language', lang);
  };

  const t = translations[language];

  // Validate token on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('civicos_officer_token');
      if (storedToken) {
        try {
          const profile = await apiService.getCurrentUser();
          if (profile.role !== 'officer' && profile.role !== 'admin') {
            logout();
          } else {
            setUser(profile);
            localStorage.setItem('civicos_officer_user', JSON.stringify(profile));
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiService.login(email, password);
    
    // Strict enforcement: Only officers/admins can use the officer portal
    if (data.user.role !== 'officer' && data.user.role !== 'admin') {
      throw new Error("Access restricted: This dashboard is reserved for Department Officers. Citizen accounts cannot access officer operations.");
    }

    localStorage.setItem('civicos_officer_token', data.access_token);
    localStorage.setItem('civicos_officer_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('civicos_officer_token');
    localStorage.removeItem('civicos_officer_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, language, setLanguage, t }}>
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
