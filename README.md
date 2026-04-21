# 🌱 DEC - Detection Evaluation Coffee

**DEC** es una aplicación multiplataforma diseñada para la **detección e identificación de enfermedades en plantas de café** utilizando inteligencia artificial y visión por computadora. La aplicación permite a los agricultores y expertos capturar imágenes de sus plantas y obtener diagnósticos rápidos de posibles patologías.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [Endpoints API](#endpoints-api)
- [Contribución](#contribución)

---

## ✨ Características

### 🎯 Funcionalidades Principales

- **Detección IA**: Utiliza modelos TensorFlow Lite para detectar enfermedades en plantas de café
- **Captura por Cámara**: Integración de cámara en dispositivos móviles y web
- **Autenticación**: Login/registro con Google, Facebook y correo electrónico
- **Historial de Detecciones**: Almacenamiento y visualización del histórico de análisis
- **Panel de Administrador**: Dashboard web para gestionar usuarios y estadísticas
- **Exportación de Datos**: Generación de reportes en múltiples formatos
- **Notificaciones**: Sistema de notificaciones en tiempo real // EN CONSTRUCCION
- **Sincronización**: Sincronización automática de datos entre dispositivo y servidor
- **Recuperación de Contraseña**: Flujo seguro de recuperación de contraseña por email

### 📱 Multiplataforma

- **Móvil**: iOS y Android (React Native con Expo)
- **Web**: Versión responsive para navegadores modernos
- **Base de Datos**: Almacenamiento local en SQLite (móvil) y sincronización con MongoDB

---

## 🏗️ Arquitectura

```
DEC/
├── backend/              # API REST (Node.js + Express)
│   ├── controllers/      # Lógica de negocio
│   ├── models/          # Esquemas MongoDB
│   ├── routes/          # Definición de rutas API
│   ├── middlewares/     # Autenticación y validaciones
│   ├── services/        # Servicios (Cloudinary, Admin)
│   └── db/             # Configuración de base de datos
│
└── frontend/DEC/        # Aplicación cliente (React Native + Web)
    ├── src/
    │   ├── screens/     # Pantallas de la aplicación
    │   ├── components/  # Componentes reutilizables
    │   ├── services/    # Servicios (API, BD, IA)
    │   ├── context/     # Context API (autenticación)
    │   ├── navigation/  # Sistema de navegación
    │   ├── hooks/       # Custom hooks
    │   └── styles/      # Estilos de pantallas
    ├── assets/          # Imágenes y modelos IA
    └── android/ios/     # Configuraciones nativas
```

---

## 💻 Tecnologías

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB + Mongoose
- **Autenticación**: JWT, Google OAuth, Facebook SDK
- **Almacenamiento de Archivos**: Cloudinary
- **Email**: Nodemailer
- **Herramientas**: Multer (upload), Archiver (exportación)

### Frontend
- **Framework**: React Native + Expo
- **Lenguaje**: JavaScript/JSX
- **Gestión de Estado**: Context API
- **Navegación**: React Navigation
- **BD Local**: SQLite
- **Cámara**: Expo Camera
- **Modelos IA**: TensorFlow Lite (best_float16.tflite), Modelo base (YOLOv11)
- **Autenticación**: Google Sign-In, Facebook SDK
- **Notificaciones**: Expo Notifications

---

## 🚀 Requisitos Previos

- **Node.js** v18+ y npm
- **MongoDB** (local o Atlas)
- **Expo CLI**: `npm install -g expo-cli`
- **Claves de API**:
  - Google OAuth (Client ID)
  - Facebook App ID y Access Token
  - Cloudinary API credentials
  - Cuenta SMTP para email (Nodemailer)

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd DEC
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/dec
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend/DEC

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << EOF
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_GOOGLE_APP_CLIENT_ID=your_google_app_client_id
EXPO_PUBLIC_API_URL=http://localhost:3000
EOF

# Iniciar aplicación
npm start

# Para web: Presiona 'w'
# Para iOS: Presiona 'i'
# Para Android: Presiona 'a'
```

---

## 📁 Estructura del Proyecto

### Backend - Controladores Principales

| Controlador | Propósito |
|------------|-----------|
| `detectionController.js` | Gestión de detecciones de enfermedades |
| `users.js` | Operaciones CRUD de usuarios |
| `registerUser.js` | Registro de nuevos usuarios |
| `googleAuth.js` | Autenticación con Google |
| `facebookAuth.js` | Autenticación con Facebook |
| `recoverPassword.js` | Recuperación de contraseña |
| `pathologyController.js` | Gestión de patologías/enfermedades |
| `statsController.js` | Estadísticas de uso |
| `notificationController.js` | Sistema de notificaciones |
| `exportController.js` | Exportación de datos |

### Frontend - Pantallas Principales

#### Móvil
- **CameraScreen.jsx**: Captura de imagen con cámara
- **Login.jsx**: Autenticación de usuarios
- **Register.jsx**: Registro de nuevas cuentas
- **MainApp.jsx**: Pantalla principal
- **HistoryScreen.jsx**: Historial de detecciones
- **DetectionDetailScreen.jsx**: Detalles de una detección
- **Result.jsx**: Resultados del análisis IA
- **Profile.jsx**: Perfil de usuario
- **EditProfile.jsx**: Edición de perfil

#### Web
- **LandingPage.web.jsx**: Página de inicio
- **AdminDashboard.web.jsx**: Panel de administrador
- **LoginAdmin.web.jsx**: Login para administradores

---

## 🔧 Uso

### Flujo Típico de Usuario

1. **Registro/Login**: Usuario se autentica con email, Google o Facebook
2. **Captura**: Toma foto de la planta con la cámara
3. **Análisis**: El modelo IA analiza la imagen
4. **Resultados**: Se muestra el diagnóstico y posibles soluciones
5. **Historial**: Se guarda en el historial del usuario
6. **Sincronización**: Los datos se sincronizan con el servidor

### Para Administradores

- Acceso al dashboard web (`/admin`)
- Visualizar estadísticas de uso
- Gestionar usuarios
- Descargar reportes
- Monitorear detecciones

---

## 🔌 Endpoints API Principales

### Autenticación
```
POST   /api/users/register         # Registro
POST   /api/users/login            # Login
POST   /api/users/google-auth      # Autenticación Google
POST   /api/users/facebook-auth    # Autenticación Facebook
POST   /api/recover-password       # Recuperar contraseña
```

### Detecciones
```
POST   /api/detection/upload       # Crear nueva detección
GET    /api/detection/:id          # Obtener detección
GET    /api/detection/user/:userId # Historial del usuario
DELETE /api/detection/:id          # Eliminar detección
```

### Usuarios
```
GET    /api/users/:id              # Obtener usuario
PUT    /api/users/:id              # Actualizar usuario
GET    /api/users                  # Listar usuarios (admin)
DELETE /api/users/:id              # Eliminar usuario
```

### Estadísticas
```
GET    /api/stats/overview         # Estadísticas generales
GET    /api/stats/pathologies      # Estadísticas de patologías
```

### Exportación
```
GET    /api/export/history         # Exportar historial
```

---

## 📊 Modelo de Datos

### Usuario
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date,
  googleId: String,
  facebookId: String,
  isAdmin: Boolean
}
```

### Detección
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  imageUrl: String,
  pathologyId: ObjectId,
  confidence: Number (0-100),
  treatment: String,
  severity: String,
  createdAt: Date
}
```

### Patología
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  symptoms: [String],
  treatment: String,
  preventionTips: [String]
}
```

---

## 🛡️ Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ Autenticación con JWT
- ✅ CORS configurado
- ✅ Validación de entrada en todas las rutas
- ✅ Recuperación segura de contraseña por email
- ✅ OAuth integrado (Google y Facebook)

---

## 📱 Compilar para Producción

### Compilar para Android
```bash
cd frontend/DEC
eas build --platform android
```

### Compilar para iOS
```bash
cd frontend/DEC
eas build --platform ios
```

### Buildear Backend
```bash
cd backend
npm run build  # Si aplica
```

---

## 🐛 Troubleshooting

### Problema: "Module not found" en imports
**Solución**: Verifica que las variables de entorno estén configuradas en `.env`

### Problema: MongoDB connection failed
**Solución**: Asegúrate que MongoDB esté corriendo y `MONGODB_URI` sea correcto

### Problema: Camera no funciona
**Solución**: Verifica los permisos en `app.json` y los permisos del sistema

### Problema: Google/Facebook auth no funciona
**Solución**: Valida los Client IDs y que estén en la whitelist de tus credenciales

---

## 📝 Variables de Entorno

### Backend (.env)
```
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Frontend (.env)
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_APP_CLIENT_ID=
EXPO_PUBLIC_API_URL=
```

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

---

## 👥 Autores

- **Equipo de Desarrollo DEC**

---

## 📞 Soporte

Para soporte o preguntas, contáctanos en el email del proyecto o abre un issue en el repositorio.

---

**Última actualización**: Abril 2026
**Estado**: En desarrollo 🚀
