import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PasswordChangeWrapper } from "@/components/PasswordChangeWrapper";
import { SessionManager } from "@/components/SessionManager";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useNotificationEvents } from "@/hooks/useNotificationEvents";
import { useWooCommercePolling } from "@/hooks/useWooCommercePolling";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import PointOfSale from "./pages/PointOfSale";
import TimeEntries from "./pages/TimeEntries";
import Incidents from "./pages/Incidents";
import Employees from "./pages/Employees";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const LayoutWithSidebar = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useAppSettings();
  
  // Inicializar el sistema de eventos de notificaciones
  useNotificationEvents();
  
  // Inicializar el sistema de polling de WooCommerce
  useWooCommercePolling();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          {/* Header solo para móvil (< 768px) */}
          <header className="sticky top-0 z-40 bg-background border-b md:hidden">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center">
                <SidebarTrigger className="shrink-0" />
                <h1 className="ml-3 text-lg font-bold">{settings.storeName}</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>
        
        {/* Contenido principal */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">
          {/* Header para tablet/desktop (>= 768px) */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <PasswordChangeWrapper>
            {children}
          </PasswordChangeWrapper>
        </main>
      </div>
    </div>
  </SidebarProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppSettingsProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Dashboard /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Products /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Orders /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/pos" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><PointOfSale /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/time-entries" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><TimeEntries /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Incidents /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Employees /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Invoices /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SessionManager><LayoutWithSidebar><Settings /></LayoutWithSidebar></SessionManager></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AppSettingsProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
