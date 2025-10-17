# 🎭 GUÍA DE INSTALACIÓN MULTIPLATAFORMA - FLAMENCO FUSION HUB

## 📋 Tabla de Contenidos
- [Requisitos Generales](#requisitos-generales)
- [Linux (Debian/Ubuntu)](#linux-debianubuntu)
- [macOS](#macos)
- [Windows](#windows)
- [Otras Distribuciones Linux](#otras-distribuciones-linux)
- [Instalación del Proyecto](#instalación-del-proyecto)
- [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Generales

Todos los sistemas operativos necesitan:
- **Docker** (versión 4.0+)
- **Node.js** (versión 18 o superior)
- **Git** (para clonar el repositorio)
- **npm** (incluido con Node.js)

---

## 🐧 Linux (Debian/Ubuntu)

### Instalar Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### Instalar Herramientas Básicas
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

---

## 🍎 macOS

### Instalar Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc
```

### Instalar Docker
```bash
brew install --cask docker
```

### Instalar Node.js
```bash
brew install node
node --version
```

---

## 🪟 Windows

### Instalar Chocolatey (PowerShell como Administrador)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Instalar Docker Desktop
```powershell
choco install docker-desktop
```

### Instalar Node.js
```powershell
choco install nodejs
node --version
```

### Instalar Supabase CLI (Windows)
```powershell
# Opción 1: Chocolatey
choco install supabase

# Opción 2: Scoop
scoop install supabase
```

---

## 🐧 Otras Distribuciones Linux

### Fedora/RHEL/CentOS
```bash
# Docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs
```

### Arch Linux/Manjaro
```bash
# Docker
sudo pacman -S docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Node.js
sudo pacman -S nodejs npm
```

### openSUSE
```bash
# Docker
sudo zypper install docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Node.js
sudo zypper install nodejs npm
```

### Alpine Linux
```bash
# Docker
apk add docker
rc-service docker start
rc-update add docker

# Node.js
apk add nodejs npm
```

### Gentoo
```bash
# Docker
emerge app-containers/docker
rc-update add docker default
/etc/init.d/docker start

# Node.js
emerge net-libs/nodejs
```

### Void Linux
```bash
# Docker
sudo xbps-install docker
sudo ln -s /etc/sv/docker /var/service/
sudo sv start docker

# Node.js
sudo xbps-install nodejs
```

### Solus
```bash
# Docker
sudo eopkg install docker
sudo systemctl start docker
sudo systemctl enable docker

# Node.js
sudo eopkg install nodejs
```

---

## 📦 Instalación del Proyecto

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd flamenco-fusion-hub
```

### 2. Crear Variables de Entorno
```bash
mkdir -p supabase/functions
nano supabase/functions/.env
```

Contenido del `.env`:
```env
# WooCommerce API
WOOCOMMERCE_URL=https://tu-tienda.com
WOOCOMMERCE_CONSUMER_KEY=ck_tu_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=cs_tu_consumer_secret

# Holded API
HOLDED_API_KEY=tu_holded_api_key

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password
```

### 3. Instalar Dependencias
```bash
# Instalar dependencias del proyecto
npm install

# Instalar Supabase CLI localmente
npm install supabase --save-dev

# Verificar
npx supabase --version
```

### 4. Configurar Docker
```bash
# Limpiar Docker
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker system prune -f
```

### 5. Iniciar Supabase
```bash
# Parar Supabase si está corriendo
npx supabase stop

# Iniciar Supabase
npx supabase start
```

### 6. Iniciar Edge Functions
```bash
# Ir a la carpeta de functions
cd supabase/functions

# Iniciar Edge Functions en background
npx supabase functions serve --no-verify-jwt --env-file .env &

# Volver al directorio raíz
cd ../..
```

### 7. Iniciar Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev
```

---

## ✅ Verificar Instalación

### URLs Disponibles
- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323
- **API REST**: http://localhost:54321
- **Mailpit**: http://localhost:54324

### Credenciales de Prueba
- **Email**: admin@flamenca.com
- **Password**: admin123

---

## 🚨 Solución de Problemas

### Error: "Docker not running"
```bash
# Linux
sudo systemctl start docker

# macOS
# Abrir Docker Desktop desde Applications

# Windows
# Abrir Docker Desktop desde el menú inicio
```

### Error: "Permission denied" (Linux)
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Error: "Port already in use"
```bash
# Linux/macOS
lsof -i :54321
kill -9 [PID]

# Windows
netstat -ano | findstr :54321
taskkill /PID [PID] /F
```

### Error: "Node.js version too old"
```bash
# Instalar versión 18+ según tu sistema operativo
# Ver secciones anteriores
```

### Error: "Supabase already running"
```bash
npx supabase stop
npx supabase start
```

### Error: "Database connection failed"
```bash
npx supabase db reset
npx supabase start
```

---

## 🎯 Comandos Útiles

### Parar Todos los Servicios
```bash
# Parar frontend
pkill -f "vite"

# Parar Edge Functions
pkill -f "supabase functions"

# Parar Supabase
npx supabase stop

# Parar Docker
docker stop $(docker ps -q)
```

### Reiniciar Todo
```bash
# Parar servicios
npx supabase stop
pkill -f "vite"
pkill -f "supabase functions"

# Limpiar Docker
docker system prune -f

# Reiniciar
npx supabase start
cd supabase/functions && npx supabase functions serve --no-verify-jwt --env-file .env &
cd ../..
npm run dev
```

### Ver Logs
```bash
# Ver logs de Supabase
npx supabase status

# Ver logs de Docker
docker logs [CONTAINER_ID]

# Ver procesos activos
ps aux | grep "supabase"
ps aux | grep "vite"
```

---

## 📝 Notas Importantes

1. **Puertos**: Asegúrate de que los puertos 5173, 54321, 54323, 54324 estén libres
2. **APIs**: Configura las API keys reales en `supabase/functions/.env`
3. **Docker**: Docker debe estar ejecutándose antes de iniciar Supabase
4. **Node.js**: Usa Node.js 18+ para compatibilidad
5. **Permisos**: En Linux, usuario debe estar en el grupo docker
6. **Supabase CLI**: Instalar localmente con `npm install supabase --save-dev`

---

## 🎉 ¡Instalación Completada!

Una vez completados todos los pasos, tendrás la aplicación **Flamenco Fusion Hub** funcionando completamente, con:

- ✅ Frontend React funcionando
- ✅ Base de datos Supabase configurada
- ✅ Edge Functions ejecutándose
- ✅ APIs externas configuradas
- ✅ Usuario admin creado

**¡La aplicación estará lista para usar!** 🎭✨

