# TradeBuddy - Project Guide

## Overview

TradeBuddy is a production-quality financial analysis platform built with React 19, TypeScript, TailwindCSS 4, and modern web technologies. The application provides real-time stock analysis, market insights, and institutional tracking for informed investing decisions.

## Design Philosophy: Modern Financial Minimalism

The entire application follows a carefully curated design system emphasizing clarity, trust, and professional aesthetics suitable for a ₹50 lakh funded startup.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #0F172A | Headlines, buttons, primary actions |
| Success | #10B981 | Bullish signals, positive trends |
| Alert | #EF4444 | Bearish signals, warnings |
| Neutral | #6B7280 | Secondary text, muted content |
| Background | #FFFFFF | Main background |
| Secondary | #F3F4F6 | Card backgrounds, subtle sections |
| Border | #E5E7EB | Dividers, borders |

### Typography System

- **Display Headlines**: Sora (600-700 weight) - Premium, modern aesthetic
- **Body Text**: Inter (400-600 weight) - Highly readable, professional
- **Monospace Data**: JetBrains Mono - Financial values and code

### Spacing & Layout

- Base unit: 8px
- Spacing scale: 8, 16, 24, 32, 40, 48px
- Border radius: 8px (cards), 4px (buttons)
- Shadows: Subtle (0 1px 3px), Medium (0 4px 12px)

## Project Structure

```
stocksignal/
├── client/
│   ├── public/              # Static assets (favicon, robots.txt)
│   ├── src/
│   │   ├── pages/          # Page components (lazy-loaded)
│   │   │   ├── Home.tsx
│   │   │   ├── StockAnalysis.tsx
│   │   │   ├── MorningBriefing.tsx
│   │   │   ├── BigMoneyTracker.tsx
│   │   │   └── NotFound.tsx
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.tsx         # Root routing component
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles & design tokens
│   └── index.html          # HTML template
├── server/                 # Express server (placeholder)
├── shared/                 # Shared types (placeholder)
└── package.json
```

## Pages Overview

### 1. Home Landing Page (`/`)

**Purpose**: Introduce TradeBuddy and drive user engagement

**Sections**:
- Hero section with COBE globe visualization
- Feature cards (6 features)
- Statistics section
- How it works (3-step process)
- Pricing tiers (Starter, Pro, Elite)
- Final CTA section

**Key Components**: GlobePulse, FeatureCard, StatCard, Button

### 2. Stock Analysis Page (`/analysis`)

**Purpose**: Deep technical and fundamental analysis

**Features**:
- Stock symbol search
- Timeframe selector (1D, 1W, 1M, 3M, 1Y, 5Y)
- Price movement chart with moving averages
- Trading volume visualization
- Technical indicators (RSI, MACD, Bollinger Bands)
- News section
- Analysis summary with support/resistance levels

**Charts**: Recharts (Area, Line, Bar, Composed)

### 3. Morning Briefing Page (`/briefing`)

**Purpose**: Curated daily market insights

**Sections**:
- Market indices (S&P 500, Nasdaq-100, Dow Jones, VIX)
- Top movers (stocks with highest changes)
- Economic calendar with impact levels
- Market insights (bullish/bearish signals)
- Sector performance

### 4. Big Money Tracker Page (`/tracker`)

**Purpose**: Track institutional and whale activities

**Sections**:
- Summary cards (block trades, institutional buys/sells)
- Latest institutional trades
- Block trades (off-exchange)
- Whale watchlist
- Insider trades table

## Performance Optimizations

### 1. Code Splitting & Lazy Loading

All pages are lazy-loaded using React.lazy() and Suspense:

```typescript
const Home = lazy(() => import("./pages/Home"));
const StockAnalysis = lazy(() => import("./pages/StockAnalysis"));
```

This reduces initial bundle size and improves Time to Interactive (TTI).

### 2. Image Optimization

- Generated images use WebP format (compressed versions)
- Images stored on CDN with optimized sizing
- Hero backgrounds use CSS background-image for lazy loading

### 3. Component Optimization

- Memoized components where necessary
- Efficient re-render prevention with proper dependency arrays
- Recharts configured for optimal performance

### 4. CSS Optimization

- TailwindCSS 4 with JIT compilation
- Minimal custom CSS (design tokens in CSS variables)
- No unused styles in production build

## Key Components

### GlobePulse

Interactive 3D globe visualization using COBE library.

```typescript
import { GlobePulse } from "@/components/ui/globe-pulse"

<GlobePulse 
  markers={defaultMarkers} 
  speed={0.003}
  className="w-full"
/>
```

### FeatureCard

Displays feature with icon, title, and description.

```typescript
import { FeatureCard } from "@/components/FeatureCard"

<FeatureCard
  icon={<BarChart3 className="w-6 h-6" />}
  title="Stock Analysis"
  description="Deep technical analysis..."
  accent="neutral"
/>
```

### StatCard

Displays key metrics with trend indicators.

```typescript
import { StatCard } from "@/components/StatCard"

<StatCard
  label="Current Price"
  value="$161.20"
  change={7.35}
  trend="up"
  icon={<TrendingUp className="w-5 h-5" />}
/>
```

## Routing

Routes are defined in `App.tsx` with lazy loading:

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Home | Landing page |
| `/analysis` | StockAnalysis | Stock analysis |
| `/briefing` | MorningBriefing | Daily briefing |
| `/tracker` | BigMoneyTracker | Institutional tracking |
| `/404` | NotFound | 404 error page |

## Development Workflow

### Starting the Dev Server

```bash
cd /home/ubuntu/stocksignal
pnpm dev
```

Server runs on `http://localhost:3000`

### Building for Production

```bash
pnpm build
```

Outputs optimized build to `dist/` directory.

### TypeScript Checking

```bash
pnpm check
```

Validates TypeScript without emitting files.

### Code Formatting

```bash
pnpm format
```

Formats code using Prettier.

## Design System Implementation

### Using Design Tokens

All colors, spacing, and typography are defined as CSS variables in `index.css`:

```css
:root {
  --primary: #0F172A;
  --accent-success: #10B981;
  --accent-alert: #EF4444;
}
```

Use in components:

```typescript
<div className="bg-primary text-white">
  Primary color button
</div>
```

### Adding New Components

When adding new components, follow these guidelines:

1. Create component in `client/src/components/`
2. Use shadcn/ui components where applicable
3. Apply design tokens for colors and spacing
4. Add TypeScript types for props
5. Include JSDoc comments with design notes

## Performance Metrics

**Target Metrics**:
- Initial load: < 2 seconds
- First Contentful Paint (FCP): < 1.5 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3 seconds

**Optimization Techniques**:
- Lazy-loaded routes reduce initial bundle
- Optimized images (WebP format)
- CSS-in-JS with TailwindCSS (no runtime overhead)
- Efficient chart rendering with Recharts

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Guidelines

- Semantic HTML structure
- ARIA labels where necessary
- Keyboard navigation support
- Color contrast ratios meet WCAG AA standards
- Focus indicators on interactive elements

## Future Enhancements

1. **Real-time Data Integration**: Connect to market data APIs
2. **User Authentication**: Implement OAuth with Manus
3. **Watchlist Management**: Save and sync user watchlists
4. **Alerts System**: Real-time price and volume alerts
5. **Portfolio Tracking**: Track user positions and performance
6. **Dark Mode**: Add dark theme variant
7. **Mobile App**: React Native version
8. **Advanced Charts**: TradingView Lightweight Charts integration

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Clear node_modules: `rm -rf node_modules && pnpm install`
2. Check TypeScript: `pnpm check`
3. Restart dev server: `pnpm dev`

### Chart Not Rendering

Ensure Recharts is properly installed:

```bash
pnpm add recharts
```

### Images Not Loading

Verify CDN URLs are correct in component props. Check browser console for 404 errors.

## Contributing

When making changes:

1. Follow the existing code style
2. Use TypeScript for type safety
3. Test responsive design at breakpoints
4. Verify all routes work correctly
5. Check console for errors/warnings

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for traders who demand excellence**
