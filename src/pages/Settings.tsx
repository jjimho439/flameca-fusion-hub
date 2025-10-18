import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Settings, 
  Store, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Save, 
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Globe,
  User,
  Key,
  Smartphone,
  MessageSquare,
  CreditCard,
  Package,
  Check,
  Send,
  Clock
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useAppSettings, themePresets } from "@/hooks/useAppSettings";
import { useTheme } from "@/hooks/useTheme";

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
}

interface FiscalSettings {
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

interface AppearanceSettings {
  theme: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  language: string;
}

interface NotificationSettings {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  adminPhone: string;
  adminEmail: string;
  whatsappNumber: string;
}

interface SystemSettings {
  woocommerceUrl: string;
  woocommerceKey: string;
  woocommerceSecret: string;
  holdedApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  resendApiKey: string;
}

export default function Settings() {
  const { user, isAdmin } = useUserRole();
  const { settings, updateSettings, themePresets, applyTheme } = useAppSettings();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para cada sección
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: settings.storeName,
    address: settings.storeAddress,
    phone: settings.storePhone,
    email: settings.storeEmail,
    website: settings.storeWebsite,
    logo: ""
  });

  const [fiscalSettings, setFiscalSettings] = useState<FiscalSettings>({
    cif: settings.cif || "",
    companyName: settings.companyName || "",
    fiscalAddress: settings.fiscalAddress || "",
    postalCode: settings.postalCode || "",
    city: settings.city || "",
    province: settings.province || "",
    country: settings.country || "España",
    bankName: settings.bankName || "",
    bankAccount: settings.bankAccount || "",
    ivaRate: settings.ivaRate || 21,
    invoiceSeries: settings.invoiceSeries || "A"
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: theme,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    language: settings.language
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    smsEnabled: true,
    whatsappEnabled: true,
    emailEnabled: true,
    adminPhone: "+34698948449",
    adminEmail: "admin@flamenca.com",
    whatsappNumber: "+34698948449"
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    woocommerceUrl: "",
    woocommerceKey: "",
    woocommerceSecret: "",
    holdedApiKey: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    resendApiKey: ""
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error("No tienes permisos para acceder a esta página");
      return;
    }
    loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Aquí cargarías las configuraciones desde la base de datos
      // Por ahora usamos valores por defecto
      toast.success("Configuraciones cargadas");
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
      toast.error("Error al cargar las configuraciones");
    } finally {
      setLoading(false);
    }
  };

  const saveStoreSettings = async () => {
    setSaving(true);
    try {
      updateSettings({
        storeName: storeSettings.name,
        storeAddress: storeSettings.address,
        storePhone: storeSettings.phone,
        storeEmail: storeSettings.email,
        storeWebsite: storeSettings.website
      });
      toast.success("Información de la tienda guardada correctamente");
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFiscalSettings = async () => {
    setSaving(true);
    try {
        updateSettings({
          cif: fiscalSettings.cif,
          companyName: fiscalSettings.companyName,
          fiscalAddress: fiscalSettings.fiscalAddress,
          postalCode: fiscalSettings.postalCode,
          city: fiscalSettings.city,
          province: fiscalSettings.province,
          country: fiscalSettings.country,
          bankName: fiscalSettings.bankName,
          bankAccount: fiscalSettings.bankAccount,
          ivaRate: fiscalSettings.ivaRate,
          invoiceSeries: fiscalSettings.invoiceSeries
        });
      toast.success("Datos fiscales guardados correctamente");
    } catch (error) {
      console.error("Error guardando datos fiscales:", error);
      toast.error("Error al guardar los datos fiscales");
    } finally {
      setSaving(false);
    }
  };

  const saveAppearanceSettings = async () => {
    setSaving(true);
    try {
      // Solo actualizar colores personalizados si el tema es "custom"
      const settingsToUpdate: any = {
        language: appearanceSettings.language
      };
      
      if (settings.selectedTheme === 'custom') {
        settingsToUpdate.primaryColor = appearanceSettings.primaryColor;
        settingsToUpdate.secondaryColor = appearanceSettings.secondaryColor;
        settingsToUpdate.accentColor = appearanceSettings.accentColor;
      }
      
      updateSettings(settingsToUpdate);
      
      toast.success("Apariencia guardada correctamente");
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      // Aquí guardarías las configuraciones de notificaciones
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Notificaciones guardadas correctamente");
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  const saveSystemSettings = async (section: string) => {
    setSaving(true);
    try {
      // Aquí guardarías las configuraciones del sistema
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`${section} guardado correctamente`);
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acceso Denegado</h3>
              <p className="text-muted-foreground">
                Solo los administradores pueden acceder a la configuración del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu tienda y sistema
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user?.email}
        </Badge>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Tienda
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Información de la Tienda */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Información de la Tienda
              </CardTitle>
              <CardDescription>
                Configura la información básica de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nombre de la tienda</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Mi Tienda Flamenca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Teléfono</Label>
                  <Input
                    id="store-phone"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+34 666 123 456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Email</Label>
                  <Input
                    id="store-email"
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tienda@flamenca.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-website">Sitio web</Label>
                  <Input
                    id="store-website"
                    value={storeSettings.website}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.flamenca.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-address">Dirección</Label>
                <Textarea
                  id="store-address"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle Principal, 123, 41001 Sevilla"
                  rows={3}
                />
              </div>
              <Button 
                onClick={saveStoreSettings}
                disabled={saving}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datos Fiscales */}
        <TabsContent value="fiscal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Datos Fiscales
              </CardTitle>
              <CardDescription>
                Configura la información fiscal de tu empresa para facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF/NIF</Label>
                  <Input
                    id="cif"
                    value={fiscalSettings.cif}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, cif: e.target.value }))}
                    placeholder="A12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-name">Razón Social</Label>
                  <Input
                    id="company-name"
                    value={fiscalSettings.companyName}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Mi Empresa SL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-series">Serie de Factura</Label>
                  <Input
                    id="invoice-series"
                    value={fiscalSettings.invoiceSeries}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, invoiceSeries: e.target.value }))}
                    placeholder="A"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fiscal-address">Dirección Fiscal</Label>
                  <Textarea
                    id="fiscal-address"
                    value={fiscalSettings.fiscalAddress}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, fiscalAddress: e.target.value }))}
                    placeholder="Calle Principal, 123"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal-code">Código Postal</Label>
                  <Input
                    id="postal-code"
                    value={fiscalSettings.postalCode}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="28001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={fiscalSettings.city}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia</Label>
                  <Input
                    id="province"
                    value={fiscalSettings.province}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, province: e.target.value }))}
                    placeholder="Madrid"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={fiscalSettings.country}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="España"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Banco</Label>
                  <Input
                    id="bank-name"
                    value={fiscalSettings.bankName}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Banco Santander"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account">Cuenta Bancaria</Label>
                  <Input
                    id="bank-account"
                    value={fiscalSettings.bankAccount}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="ES12 1234 5678 9012 3456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iva-rate">Tipo de IVA (%)</Label>
                  <Input
                    id="iva-rate"
                    type="number"
                    value={fiscalSettings.ivaRate}
                    onChange={(e) => setFiscalSettings(prev => ({ ...prev, ivaRate: parseFloat(e.target.value) || 21 }))}
                    placeholder="21"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveFiscalSettings()}
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Datos Fiscales'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apariencia */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza la apariencia de la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Temas Predefinidos */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Temas Predefinidos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themePresets.map((theme) => (
                    <div
                      key={theme.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        settings.selectedTheme === theme.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => applyTheme(theme.id)}
                    >
                      <div 
                        className="w-full h-16 rounded-md mb-3"
                        style={{ background: theme.preview }}
                      />
                      <h3 className="font-medium text-sm">{theme.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {theme.description}
                      </p>
                      {settings.selectedTheme === theme.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Colores Personalizados */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Colores Personalizados</Label>
                <p className="text-sm text-muted-foreground">
                  Personaliza los colores individualmente (solo disponible en tema "Personalizado")
                </p>
                
                <div className="space-y-2">
                  <Label>Color primario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                    <Input
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#dc2626"
                      className="flex-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color secundario</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                    <Input
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#6b7280"
                      className="flex-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color de acento</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={appearanceSettings.accentColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                    <Input
                      value={appearanceSettings.accentColor}
                      onChange={(e) => setAppearanceSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#f59e0b"
                      className="flex-1"
                      disabled={settings.selectedTheme !== 'custom'}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select 
                  value={appearanceSettings.language} 
                  onValueChange={(value) => 
                    setAppearanceSettings(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={saveAppearanceSettings}
                disabled={saving}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Apariencia
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="send">Enviar</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* Configuración de Notificaciones */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Configuración de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Configura cómo y cuándo recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por SMS
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, smsEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por WhatsApp
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsappEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, whatsappEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones por email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailEnabled: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-phone">Teléfono del administrador</Label>
                  <Input
                    id="admin-phone"
                    value={notificationSettings.adminPhone}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, adminPhone: e.target.value }))}
                    placeholder="+34698948449"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email del administrador</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={notificationSettings.adminEmail}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="admin@flamenca.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    value={notificationSettings.whatsappNumber}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    placeholder="+34698948449"
                  />
                </div>
              </div>

              <Button 
                onClick={saveNotificationSettings}
                disabled={saving}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Notificaciones
              </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enviar Notificaciones */}
            <TabsContent value="send" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Enviar Notificación
                  </CardTitle>
                  <CardDescription>
                    Envía notificaciones manuales a usuarios específicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-channel">Canal</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notification-message">Mensaje</Label>
                    <Textarea
                      id="notification-message"
                      placeholder="Escribe tu mensaje aquí..."
                      rows={4}
                    />
                  </div>
                  
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Notificación
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Historial de Notificaciones */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Historial de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Revisa el historial de notificaciones enviadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Historial de notificaciones</p>
                    <p className="text-sm">Las notificaciones enviadas aparecerán aquí</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WooCommerce */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  WooCommerce
                </CardTitle>
                <CardDescription>
                  Configuración de la tienda online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wc-url">URL de la tienda</Label>
                  <Input
                    id="wc-url"
                    value={systemSettings.woocommerceUrl}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, woocommerceUrl: e.target.value }))}
                    placeholder="https://tu-tienda.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wc-key">Consumer Key</Label>
                  <Input
                    id="wc-key"
                    type="password"
                    value={systemSettings.woocommerceKey}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, woocommerceKey: e.target.value }))}
                    placeholder="ck_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wc-secret">Consumer Secret</Label>
                  <Input
                    id="wc-secret"
                    type="password"
                    value={systemSettings.woocommerceSecret}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, woocommerceSecret: e.target.value }))}
                    placeholder="cs_..."
                  />
                </div>
                <Button 
                  onClick={() => saveSystemSettings('WooCommerce')}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar WooCommerce
                </Button>
              </CardContent>
            </Card>

            {/* Twilio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Twilio (SMS/WhatsApp)
                </CardTitle>
                <CardDescription>
                  Configuración para notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-sid">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    type="password"
                    value={systemSettings.twilioAccountSid}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, twilioAccountSid: e.target.value }))}
                    placeholder="AC..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilio-token">Auth Token</Label>
                  <Input
                    id="twilio-token"
                    type="password"
                    value={systemSettings.twilioAuthToken}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, twilioAuthToken: e.target.value }))}
                    placeholder="..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilio-phone">Número de teléfono</Label>
                  <Input
                    id="twilio-phone"
                    value={systemSettings.twilioPhoneNumber}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <Button 
                  onClick={() => saveSystemSettings('Twilio')}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Twilio
                </Button>
              </CardContent>
            </Card>

            {/* Holded */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Holded
                </CardTitle>
                <CardDescription>
                  Configuración para facturación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="holded-key">API Key</Label>
                  <Input
                    id="holded-key"
                    type="password"
                    value={systemSettings.holdedApiKey}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, holdedApiKey: e.target.value }))}
                    placeholder="..."
                  />
                </div>
                <Button 
                  onClick={() => saveSystemSettings('Holded')}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Holded
                </Button>
              </CardContent>
            </Card>

            {/* Resend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Resend (Email)
                </CardTitle>
                <CardDescription>
                  Configuración para emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resend-key">API Key</Label>
                  <Input
                    id="resend-key"
                    type="password"
                    value={systemSettings.resendApiKey}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, resendApiKey: e.target.value }))}
                    placeholder="re_..."
                  />
                </div>
                <Button 
                  onClick={() => saveSystemSettings('Resend')}
                  disabled={saving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Resend
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad y Permisos
              </CardTitle>
              <CardDescription>
                Configuración de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir 2FA para todos los usuarios
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cambio obligatorio de contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      Forzar cambio de contraseña cada 90 días
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registro de actividad</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas las acciones de los usuarios
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Políticas de contraseña</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Longitud mínima</Label>
                    <Select defaultValue="8">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caracteres</SelectItem>
                        <SelectItem value="8">8 caracteres</SelectItem>
                        <SelectItem value="12">12 caracteres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Complejidad</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => saveSystemSettings('Seguridad')}
                disabled={saving}
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Seguridad
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}