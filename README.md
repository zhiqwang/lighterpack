LighterPack
===========
LighterPack helps you track the gear you bring on adventures.

Prerequisites
-----------
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (running locally or a remote instance)

Getting Started
-----------

1. Clone the repository
   ```bash
   git clone https://github.com/galenmaly/lighterpack.git
   cd lighterpack
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start MongoDB
   ```bash
   mongod
   ```

4. Configuration (optional)
   - Copy `config/default.json` to `config/local.json` and modify settings as needed
   - Key settings: `databaseUrl`, `port`, `devServerPort`, `imgurClientID`, `mailgunAPIKey`

Build Commands
-----------

### Production Build
Build the frontend assets (outputs to `public/dist/`):
```bash
npm run build
```

### Start (Production)
Build assets and start the Express server:
```bash
npm start
```
The app will be available at `http://localhost:3000`

### Development
Start the app in development mode with Webpack Dev Server (hot reload):
```bash
npm run dev
```
The dev server runs at `http://localhost:8080` and proxies API requests to `http://localhost:3000`

### Linting
```bash
# Lint and fix JavaScript / Vue files
npm run lint:js

# Lint and fix CSS / SCSS files
npm run lint:css
```

### End-to-End Tests
```bash
npx playwright test
```

Project Structure
-----------
```
├── app.js                   # Express server entry point
├── _index.html              # SPA shell template
├── webpack.config.js        # Production webpack config
├── webpack.development.config.js  # Development webpack config
├── client/                  # Frontend (Vue 2 SPA)
│   ├── lighterpack.js       # App bootstrap
│   ├── routes.js            # Vue Router routes
│   ├── dataTypes.js         # Shared data model (Item, Category, List, Library)
│   ├── store/store.js       # Vuex store with auto-save
│   ├── views/               # Page-level Vue components
│   ├── components/          # Reusable Vue components
│   ├── css/                 # SCSS stylesheets
│   └── utils/               # Utility functions (weight, color, etc.)
├── server/                  # Backend (Express)
│   ├── endpoints.js         # REST API routes
│   ├── views.js             # Server-rendered share/embed/CSV pages
│   ├── auth.js              # Authentication (bcrypt + cookie sessions)
│   └── log.js               # Winston logger
├── config/                  # App configuration
├── templates/               # Mustache templates for share/embed pages
├── public/                  # Static assets and build output
├── test/                    # E2E tests (Playwright) and load tests
└── docker/                  # Docker deployment files
```

Future non-feature initiatives
-----------
- Migrate to postgres document store from mongo