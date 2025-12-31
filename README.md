# Rasin Gonav

**Platfom kominotè pou La Gonâve** - A community platform combining Sol Lakay (savings groups) and Rasin Lidèchip (VPC leadership training) for the La Gonâve community in Haiti.

## Overview

Rasin Gonav is a Progressive Web App (PWA) designed to support community development initiatives on La Gonâve island, Haiti. The platform provides:

- **Sol Lakay** - Savings group (mutuelle) management with member tracking, contributions, and loans
- **Rasin Lidèchip** - Leadership training program tracking for VPC (Village Planning Committee) members
- **Offline-First** - Full functionality without internet connection using IndexedDB

## Features

### Savings Groups (Gwoup Epay)
- Create and manage multiple savings groups
- Track group members with roles (president, treasurer, secretary, member)
- Record weekly/monthly contributions (kotizasyon)
- Manage loans with interest tracking
- View group balances and financial summaries

### Leadership Training (Fòmasyon)
- Track VPC member participation
- Record training sessions and attendance
- Monitor action plan progress
- Generate leadership development reports

### Dashboard
- Overview statistics with charts
- Quick access to all features
- Sync status indicator
- Haitian Creole interface

## Technology Stack

- **Framework**: Angular 20 + Ionic 8
- **Language**: TypeScript
- **Data Storage**: IndexedDB (offline-first)
- **Styling**: SCSS with Haiti flag color theme
- **UI Language**: Haitian Creole (Kreyòl)
- **Build**: Capacitor-ready for Android/iOS

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/rasin-gonav.git
cd rasin-gonav

# Install dependencies
npm install

# Start development server
npm start
```

Open http://localhost:4200 in your browser.

### Build for Production

```bash
# Standard production build
npm run build:prod

# Build for GitHub Pages
npm run build:gh-pages
```

## Project Structure

```
src/
├── app/
│   ├── models/          # TypeScript interfaces
│   ├── pages/           # Application pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── groups/      # Savings groups list
│   │   ├── members/     # Group members
│   │   ├── contributions/ # Contribution tracking
│   │   ├── loans/       # Loan management
│   │   ├── leadership/  # VPC leadership
│   │   └── training/    # Training sessions
│   └── services/        # Data & auth services
├── assets/              # Static assets
├── theme/               # Ionic theme variables
└── environments/        # Environment configs
```

## Demo Data

The app seeds demo data on first launch for testing:
- 3 savings groups with 15 members
- Sample contributions and loans
- VPC members and training records

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm test` | Run unit tests |
| `npm run lint` | Lint code |
| `npm run build:prod` | Production build |
| `npm run build:gh-pages` | Build for GitHub Pages |

## Deployment

### GitHub Pages

1. Build for GitHub Pages:
   ```bash
   npm run build:gh-pages
   ```

2. The output is in `www/` directory

3. Deploy using GitHub Pages or manually upload

### Android (Capacitor)

```bash
# Add Android platform
ionic capacitor add android

# Sync and open
ionic capacitor sync android
ionic capacitor open android
```

## Contributing

Contributions are welcome! This is an open-source project supporting community development in Haiti.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Feel free to use and modify for community development projects.

## About

Built with support from **Rasin Devlopman** (Roots of Development) - working with the people of La Gonâve to build sustainable communities.

Website: https://rootsofdevelopment.org/

---

*Ansanm nou ka fè tout bagay* - Together we can do anything
