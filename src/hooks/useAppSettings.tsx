import { createContext, useContext, useEffect, useState } from 'react';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  preview: string; // CSS gradient para preview
}

interface AppSettings {
  storeName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  selectedTheme: string; // ID del tema seleccionado
  language: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeWebsite: string;
  // Datos fiscales
  cif: string;
  companyName: string;
  fiscalAddress: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  bankName: string;
  bankAccount: string;
  ivaRate: number;
  invoiceSeries: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isLoading: boolean;
  themePresets: ThemePreset[];
  applyTheme: (themeId: string) => void;
}

// Temas predefinidos elegantes
export const themePresets: ThemePreset[] = [
  {
    id: 'flamenco-classic',
    name: 'Flamenco Clásico',
    description: 'El tema original de la app con rojo flamenco y negro elegante',
    primaryColor: '#dc2626',
    secondaryColor: '#1f2937',
    accentColor: '#f59e0b',
    preview: 'linear-gradient(135deg, #dc2626, #1f2937)'
  },
  {
    id: 'ocean-breeze',
    name: 'Brisa Marina',
    description: 'Azules profundos con acentos turquesa para un look profesional',
    primaryColor: '#0ea5e9',
    secondaryColor: '#1e40af',
    accentColor: '#06b6d4',
    preview: 'linear-gradient(135deg, #0ea5e9, #1e40af)'
  },
  {
    id: 'forest-green',
    name: 'Verde Bosque',
    description: 'Verdes naturales con toques dorados para un ambiente acogedor',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    accentColor: '#d97706',
    preview: 'linear-gradient(135deg, #059669, #064e3b)'
  },
  {
    id: 'royal-purple',
    name: 'Púrpura Real',
    description: 'Púrpuras elegantes con acentos dorados para un look lujoso',
    primaryColor: '#7c3aed',
    secondaryColor: '#4c1d95',
    accentColor: '#f59e0b',
    preview: 'linear-gradient(135deg, #7c3aed, #4c1d95)'
  },
  {
    id: 'sunset-orange',
    name: 'Atardecer Naranja',
    description: 'Naranjas cálidos con grises modernos para un ambiente energético',
    primaryColor: '#ea580c',
    secondaryColor: '#374151',
    accentColor: '#fbbf24',
    preview: 'linear-gradient(135deg, #ea580c, #374151)'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    description: 'Crea tu propio tema con colores únicos',
    primaryColor: '#dc2626',
    secondaryColor: '#6b7280',
    accentColor: '#f59e0b',
    preview: 'linear-gradient(135deg, #dc2626, #6b7280, #f59e0b)'
  }
];

const defaultSettings: AppSettings = {
  storeName: "Flamenca Store",
  primaryColor: "#dc2626",
  secondaryColor: "#1f2937",
  accentColor: "#f59e0b",
  selectedTheme: "flamenco-classic",
  language: "es",
  storeAddress: "",
  storePhone: "",
  storeEmail: "",
  storeWebsite: "",
  // Datos fiscales por defecto
  cif: "",
  companyName: "",
  fiscalAddress: "",
  postalCode: "",
  city: "",
  province: "",
  country: "España",
  bankName: "",
  bankAccount: "",
  ivaRate: 21,
  invoiceSeries: "A"
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar configuraciones guardadas
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Guardar en localStorage
    localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
    
    // Aplicar cambios inmediatamente
    applySettings(updatedSettings);
  };

  const applyTheme = (themeId: string) => {
    const theme = themePresets.find(t => t.id === themeId);
    if (theme) {
      updateSettings({
        selectedTheme: themeId,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor
      });
    }
  };

  const hexToHsl = (hex: string): string => {
    if (!hex.startsWith('#')) return hex;
    
    const r = parseInt(hex.substr(1, 2), 16) / 255;
    const g = parseInt(hex.substr(3, 2), 16) / 255;
    const b = parseInt(hex.substr(5, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applySettings = (newSettings: AppSettings) => {
    const root = document.documentElement;
    
    // Aplicar colores convertidos a HSL
    root.style.setProperty('--primary', hexToHsl(newSettings.primaryColor));
    root.style.setProperty('--secondary', hexToHsl(newSettings.secondaryColor));
    root.style.setProperty('--accent', hexToHsl(newSettings.accentColor));
    
    // Actualizar título de la página
    document.title = newSettings.storeName;
    
    // Actualizar meta tags si es necesario
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', newSettings.storeName);
    }
  };

  // Aplicar configuraciones al cargar
  useEffect(() => {
    if (!isLoading) {
      applySettings(settings);
    }
  }, [settings, isLoading]);

  return (
    <AppSettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      isLoading, 
      themePresets, 
      applyTheme 
    }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
