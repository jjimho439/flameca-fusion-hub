# 🧪 Guía de Pruebas Unitarias

Este proyecto incluye un sistema completo de pruebas unitarias configurado con **Vitest** y **Testing Library**.

## 📋 Configuración

### Dependencias instaladas:
- `vitest` - Framework de testing
- `@testing-library/react` - Utilidades para testing de React
- `@testing-library/jest-dom` - Matchers adicionales para DOM
- `@testing-library/user-event` - Simulación de eventos de usuario
- `jsdom` - Entorno DOM para testing

## 🚀 Comandos disponibles

```bash
# Ejecutar pruebas en modo watch
npm run test

# Ejecutar pruebas una sola vez
npm run test:run

# Ejecutar pruebas con interfaz gráfica
npm run test:ui

# Ejecutar pruebas con cobertura
npm run test:coverage
```

## 📁 Estructura de pruebas

```
src/test/
├── setup.ts                 # Configuración global de pruebas
├── components/              # Pruebas de componentes UI
│   ├── Button.test.tsx
│   └── Card.test.tsx
├── lib/                     # Pruebas de utilidades
│   └── utils.test.ts
└── utils/                   # Pruebas de funciones utilitarias
    └── formatPrice.test.ts
```

## ✅ Pruebas implementadas

### Componentes UI
- **Button**: Renderizado, variantes, tamaños, eventos click, estado disabled
- **Card**: Renderizado, estructura, clases CSS
- **Input**: Renderizado, eventos, estado disabled, tipos de input, clases CSS
- **Badge**: Renderizado, variantes (default, secondary, destructive, outline), clases CSS

### Utilidades
- **cn()**: Fusión de clases CSS, clases condicionales, manejo de valores nulos
- **formatPrice()**: Formateo de precios en euros, decimales, números negativos
- **Validación**: Email, teléfono, precios
- **Cálculos**: Totales, IVA, formateo de moneda

### Tipos TypeScript
- **Order**: Propiedades requeridas y tipos
- **Product**: Estructura de datos
- **Employee**: Información de empleados
- **DashboardStats**: Estadísticas del dashboard
- **CartItem**: Elementos del carrito

## 🔧 Configuración de mocks

El archivo `src/test/setup.ts` incluye mocks para:
- Supabase client
- window.matchMedia
- ResizeObserver
- IntersectionObserver

## 📊 Cobertura de pruebas

Las pruebas cubren:
- ✅ Componentes UI básicos (Button, Card, Input, Badge)
- ✅ Funciones utilitarias (cn, formatPrice)
- ✅ Validación de datos (email, teléfono, precios)
- ✅ Cálculos matemáticos (totales, IVA, moneda)
- ✅ Tipos TypeScript (estructuras de datos)
- ✅ Manejo de clases CSS
- ✅ Eventos de usuario
- ✅ Estados de componentes

## 🎯 Próximos pasos

Para expandir las pruebas, considera agregar:
- Pruebas de hooks personalizados (useTheme, useUserRole, etc.)
- Pruebas de integración de páginas (Dashboard, Products, Orders)
- Pruebas de flujos de usuario completos
- Pruebas de componentes con estado
- Pruebas de formularios
- Pruebas de Edge Functions de Supabase
- Pruebas de integración con APIs externas
- Pruebas de rendimiento

## 📝 Ejemplo de prueba

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
```

## 🚨 Notas importantes

- Las pruebas están configuradas para ejecutarse en un entorno JSDOM
- Los mocks están configurados para evitar dependencias externas
- Las pruebas se ejecutan en paralelo para mejor rendimiento
- Se incluyen matchers personalizados de jest-dom
