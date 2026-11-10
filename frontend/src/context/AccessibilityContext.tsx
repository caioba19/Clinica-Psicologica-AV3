import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityContextType {
  fontSizeLevel: 'normal' | 'large' | 'xlarge';
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  openA11yModal: boolean;
  setOpenA11yModal: (open: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (localStorage.getItem('psico_font_size') as any) || 'normal';
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('psico_high_contrast') === 'true';
  });

  const [openA11yModal, setOpenA11yModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('psico_font_size', fontSizeLevel);
    document.documentElement.setAttribute('data-font-size', fontSizeLevel);
  }, [fontSizeLevel]);

  useEffect(() => {
    localStorage.setItem('psico_high_contrast', String(highContrast));
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
      document.body.classList.add('high-contrast');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const increaseFontSize = () => {
    setFontSizeLevel((prev) => (prev === 'normal' ? 'large' : 'xlarge'));
  };

  const decreaseFontSize = () => {
    setFontSizeLevel((prev) => (prev === 'xlarge' ? 'large' : 'normal'));
  };

  const resetFontSize = () => {
    setFontSizeLevel('normal');
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSizeLevel,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        highContrast,
        toggleHighContrast,
        openA11yModal,
        setOpenA11yModal
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
