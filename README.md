# Clashing Destiny v2

A competitive 2-player online card game built with modern web technologies.

## About the Project

Clashing Destiny is a strategic card game where two players battle to reduce their opponent's Health Points to 0. Players use heroes, minions, spells, and artifacts in tactical combat. The game features unique mechanics like the Destiny Zone system and dynamic turn-based gameplay with card chains.

**Inspirations:** Grand Archive, Might and Magic: Duel of Champions, Legends of Runeterra

## Architecture

This is a monorepo containing multiple packages that work together to create the complete game experience:

### Packages

#### `packages/client`

The frontend Vue.js application that provides the game interface. Built with:

- **Vue 3** with TypeScript
- **Vite** for development and building
- **UnoCSS** for styling

#### `packages/api`

Backend API and database layer using Convex:

- **Convex** for real-time database and API
- User authentication and authorization
- Matchmaking system
- Player data persistence

#### `packages/server`

Game server for real-time multiplayer functionality:

- **Express.js** server with Socket.IO
- **Upstash Redis** for session management
- Real-time game logic execution
- Game state management

#### `packages/engine`

Core game logic and rules engine:

- Pure TypeScript game mechanics
- Card definitions and abilities
- Combat system and rule validation
- Shared between client and server

#### `packages/shared`

Common utilities and types:

- Shared TypeScript types and interfaces
- Validation schemas with Zod
- Common utilities and helpers
- Used across all other packages

### Configuration Packages

- `configs/eslint-config` - Shared ESLint configuration
- `configs/stylelint-config` - Shared Stylelint configuration
- `configs/tsconfig` - Shared TypeScript configuration
- `configs/uno` - UnoCSS configuration and presets
- `configs/assetpack` - Asset processing configuration

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v10 or higher)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up External Services

You'll need to create accounts and projects for the following services:

#### Convex (Database & API)

1. Go to [Convex](https://convex.dev/) and create an account
2. Create a new project for your game
3. Note your deployment URL

#### Upstash Redis (Session Management)

1. Go to [Upstash](https://upstash.com/) and create an account
2. Create a new Redis database
3. Note your Redis URL and token

### 3. Environment Configuration

Create `.env` files in the following packages with the required variables (you can see the `.env.example` files in the respective package for more informations) :

### 4. Configure Convex Environment Variables

In your Convex dashboard, add the following environment variable:

- `GAME_SERVER_API_KEY` - A secure API key for communication between Convex and the game server. Use this same variable for the `CONVEX_API_KEY` environment variable in the `server` package

### 5. Start Development

Start all services in development mode:

```bash
npm run dev
```

This will start:

- **Client** (Vue.js app) - typically on `http://localhost:5173`
- **API** (Convex) - managed by Convex dev server
- **Server** (Game server) - typically on `http://localhost:3001`

## Project Structure

```
├── packages/
│   ├── client/         # Vue.js frontend
│   ├── api/           # Convex backend
│   ├── server/        # Game server
│   ├── engine/        # Game logic
│   └── shared/        # Common utilities
├── configs/           # Shared configurations
├── docs/             # Documentation
├── concept_art/      # Game art assets
└── prototype/        # Early prototypes
```

## Contributing

Please read the design documents in the `docs/` folder to understand the game mechanics and architecture before contributing.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
