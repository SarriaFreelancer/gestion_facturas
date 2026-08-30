# 📄 Gestión de Facturas

Aplicación web para la gestión de facturas, construida con **React**, **Express**, **MySQL** y **Prisma**.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite |
| Backend | Express 5 (Node.js) |
| Base de datos | MySQL 8 |
| ORM | Prisma |
| Estilos | CSS / Lucide React |

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd gestion_facturas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=GESTION_FACTURAS
```

### 4. Crear la base de datos

Importa el esquema SQL incluido en el proyecto:

```bash
mysql -u root -p < GESTION_FACTURAS.sql
```

### 5. Sincronizar Prisma

```bash
npx prisma db pull
```

---

## ▶️ Ejecución

### Modo desarrollo

```bash
# Backend
node src/server.js

# Frontend (en otra terminal)
npm run dev
```

### Build de producción

```bash
npm run build
```

---

## 📁 Estructura del proyecto

```
gestion_facturas/
├── src/              # Código fuente del backend y frontend
├── prisma/           # Esquema y configuración de Prisma
├── public/           # Archivos estáticos
├── index.html        # Punto de entrada del frontend
├── vite.config.ts    # Configuración de Vite
├── prisma.config.ts  # Configuración de Prisma
├── .env.example      # Variables de entorno de ejemplo
└── GESTION_FACTURAS.sql  # Esquema de la base de datos
```

---

## 📋 Requisitos previos

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9
