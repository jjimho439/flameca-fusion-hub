import { Home, Package, Users, ClipboardList, AlertCircle, Clock, LogOut, FileText, ShoppingCart, Settings, LucideIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { getRoleLabel, getRoleColor, Permission } from "@/lib/permissions";
import { useAppSettings } from "@/hooks/useAppSettings";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAppNotifications } from "@/hooks/useAppNotifications";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: Permission;
  section?: string;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home, permission: "view_dashboard" },
  { title: "Productos", url: "/products", icon: Package, permission: "view_products", section: "products" },
  { title: "Encargos", url: "/orders", icon: ClipboardList, permission: "view_orders", section: "orders" },
  { title: "TPV", url: "/pos", icon: ShoppingCart, permission: "access_pos", section: "pos" },
  { title: "Fichajes", url: "/time-entries", icon: Clock, permission: "view_time_entries" },
  { title: "Incidencias", url: "/incidents", icon: AlertCircle, permission: "view_incidents", section: "incidents" },
  { title: "Empleados", url: "/employees", icon: Users, permission: "view_employees" },
  { title: "Facturación", url: "/invoices", icon: FileText, permission: "view_invoices" },
  { title: "Configuración", url: "/settings", icon: Settings, permission: "manage_settings" },
];

export function AppSidebar() {
  const { state, isMobile } = useSidebar();
  const navigate = useNavigate();
  const { userRole, can, loading, user } = useUserRole();
  const { settings } = useAppSettings();
  const { sectionCounts, markAsRead } = useAppNotifications();
  const [userName, setUserName] = useState<string>("");
  
  // En móvil siempre mostramos textos, en desktop depende del estado
  const showText = isMobile || state === "expanded";

  // Obtener el nombre del usuario de la tabla profiles
  useEffect(() => {
    const fetchUserName = async () => {
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          
          if (profile?.full_name) {
            setUserName(profile.full_name);
          } else {
            // Fallback al email sin dominio
            setUserName(user.email?.split('@')[0] || 'Usuario');
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          // Fallback al email sin dominio
          setUserName(user.email?.split('@')[0] || 'Usuario');
        }
      }
    };

    fetchUserName();
  }, [user]);

  // Filtrar items del menú según permisos
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return can(item.permission);
  });

  const handleLogout = async () => {
    try {
      console.log("Iniciando logout...");
      
      // Intentar cerrar sesión
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast.error("Error al cerrar sesión: " + error.message);
        
        // Si hay error, forzar la navegación de todas formas
        console.log("Forzando navegación a /auth...");
        navigate("/auth");
        
        // Limpiar el localStorage como medida adicional
        localStorage.clear();
        sessionStorage.clear();
      } else {
        console.log("Logout exitoso, navegando a /auth");
        navigate("/auth");
      }
    } catch (err) {
      console.error("Error inesperado durante logout:", err);
      toast.error("Error inesperado al cerrar sesión");
      
      // Forzar navegación y limpiar almacenamiento
      navigate("/auth");
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-3 space-y-2">
            {showText && (
              <>
                <div className="sidebar-brand text-lg">
                  {settings.storeName}
                </div>
                {user && (
                  <div className="sidebar-user text-sm font-medium">
                    {userName || 'Usuario'}
                  </div>
                )}
                <Badge className={getRoleColor(userRole)}>
                  {getRoleLabel(userRole)}
                </Badge>
              </>
            )}
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const notificationCount = item.section ? sectionCounts[item.section] || 0 : 0;
                
                // Debug: mostrar contadores en consola
                if (item.section && notificationCount > 0) {
                  console.log(`Notificaciones en ${item.section}:`, notificationCount);
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "sidebar-menu-item active"
                            : "sidebar-menu-item"
                        }
                        onClick={() => {
                          // Marcar notificaciones de esta sección como leídas al hacer clic
                          if (item.section && notificationCount > 0) {
                            markAsRead(undefined, item.section);
                          }
                        }}
                      >
                        <div className="relative">
                          <item.icon className="h-5 w-5 shrink-0" />
                          {notificationCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                            >
                              {notificationCount > 9 ? '9+' : notificationCount}
                            </Badge>
                          )}
                        </div>
                        {showText && <span className="ml-2">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <LogOut className="h-5 w-5 shrink-0" />
                  {showText && <span className="ml-2">Cerrar Sesión</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
