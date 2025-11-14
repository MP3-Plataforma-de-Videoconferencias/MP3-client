structura de Carpetas

```
MP3-client/
│
├── public/                          # Archivos estáticos públicos
│
├── src/                             # Código fuente principal
│   │
│   ├── assets/                      # Recursos estáticos
│   │   ├── images/                  # Imágenes
│   │   └── icons/                   # Iconos
│   │
│   ├── components/                  # Componentes React
│   │   ├── auth/                    # Componentes de autenticación
│   │   ├── common/                  # Componentes reutilizables
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   ├── layout/                  # Componentes de layout
│   │   │   ├── Header.tsx           # Encabezado con menú
│   │   │   ├── Footer.tsx           # Pie de página con sitemap
│   │   │   └── MainLayout.tsx       # Layout principal
│   │   ├── meetings/                # Componentes de reuniones
│   │   └── videoconference/         # Componentes de videoconferencia
│   │       ├── ChatPanel.tsx        # Panel de chat (UI only)
│   │       └── StreamingPlayer.tsx  # Reproductor de streaming (UI only)
│   │
│   ├── contexts/                    # Contextos de React
│   │   └── AuthContext.tsx          # Contexto de autenticación
│   │
│   ├── hooks/                       # Hooks personalizados
│   │   └── useLocalStorage.ts       # Hook para localStorage
│   │
│   ├── pages/                       # Páginas de la aplicación
│   │   ├── HomePage.tsx             # Página de inicio con sitemap
│   │   ├── AboutPage.tsx            # Página "Sobre nosotros"
│   │   ├── LoginPage.tsx            # Página de login
│   │   ├── RegisterPage.tsx         # Página de registro
│   │   ├── ForgotPasswordPage.tsx   # Recuperación de contraseña
│   │   ├── ProfilePage.tsx          # Perfil de usuario
│   │   ├── CreateMeetingPage.tsx    # Crear reunión
│   │   └── VideoConferencePage.tsx  # Plataforma de videoconferencia
│   │
│   ├── router/                      # Configuración de rutas
│   │   └── AppRouter.tsx            # Router principal
│   │
│   ├── services/                    # Servicios de API
│   │   ├── api.ts                   # Cliente API base (Fetch)
│   │   ├── userService.ts           # Servicio de usuarios
│   │   └── meetingService.ts        # Servicio de reuniones
│   │
│   ├── styles/                      # Estilos globales
│   │   └── index.scss               # Estilos principales (SASS + Tailwind)
│   │
│   ├── types/                       # Definiciones de tipos TypeScript
│   │   └── index.ts                 # Tipos e interfaces
│   │
│   ├── utils/                       # Utilidades
│   │   ├── constants.ts             # Constantes de la aplicación
│   │   ├── validators.ts            # Funciones de validación
│   │   └── index.ts                 # Exportaciones
│   │
│   ├── App.tsx                      # Componente raíz
│   ├── main.tsx                     # Punto de entrada
│   └── vite-env.d.ts                # Tipos de Vite
│
├── index.html                       # HTML principal
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript
├── tsconfig.node.json               # Configuración TypeScript para Node
├── vite.config.ts                   # Configuración de Vite
├── tailwind.config.js               # Configuración de Tailwind CSS
├── postcss.config.js                # Configuración de PostCSS
├── .eslintrc.cjs                    # Configuración de ESLint
├── .gitignore                       # Archivos ignorados por Git
└── README.md                        # Documentación del proyecto
```