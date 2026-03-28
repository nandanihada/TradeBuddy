import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";

// Lazy load pages for optimal performance
const Home = lazy(() => import("./pages/Home"));
const StockAnalysis = lazy(() => import("./pages/StockAnalysis"));
const MorningBriefing = lazy(() => import("./pages/MorningBriefing"));
const BigMoneyTracker = lazy(() => import("./pages/BigMoneyTracker"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analysis" component={StockAnalysis} />
        <Route path="/briefing" component={MorningBriefing} />
        <Route path="/tracker" component={BigMoneyTracker} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

/**
 * App Component
 * 
 * Root application component with routing and theme setup.
 * 
 * Design: Modern Financial Minimalism
 * - Light theme by default with deep slate primary color
 * - Lazy-loaded routes for performance optimization
 * - Error boundary for graceful error handling
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
