# MP3-client

Frontend repository for the MP3 video conference platform.

## Tech Stack

- **Vite.js** - Build tool and development server
- **React** - UI library
- **TypeScript** - Type safety
- **SASS/Tailwind CSS** - Styling
- **React Router** - Routing

## Project Structure

```
MP3-client/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── common/       # Reusable components
│   │   ├── layout/       # Layout components (Header, Footer)
│   │   ├── meetings/     # Meeting-related components
│   │   └── videoconference/ # Video conference components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── router/           # Routing configuration
│   ├── services/         # API services
│   ├── styles/           # Global styles (SASS)
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Features

- User registration and authentication (Manual, Google, Facebook)
- User profile management
- Meeting creation and management
- Video conference platform (UI only)
- Responsive design
- WCAG accessibility guidelines
- Usability heuristics implementation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your API configuration and OAuth credentials.

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `VITE_FACEBOOK_APP_ID` - Facebook OAuth app ID
- `VITE_ENV` - Environment (development/production)

## Code Style

- Code is written in English
- JSDoc comments for documentation
- TypeScript for type safety
- Consistent naming conventions (camelCase for variables/functions, PascalCase for components)
- ESLint for code quality

## License

MIT
