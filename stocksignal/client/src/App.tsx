import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { lazy, Suspense, useState, useCallback, type ComponentType } from "react";
import Preloader from "@/components/ui/preloader";
import { LanguageSelector } from "@/components/LanguageSelector";

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

// Protected route wrapper — redirects to /login if not authenticated, shows language picker if needed
function ProtectedRoute({ component: Component, path }: { component: ComponentType; path: string }) {
  const { user, loading } = useAuth();
  const [lang, setLang] = useState(() => localStorage.getItem("tradebuddy_lang") || "");

  if (loading) return <LoadingFallback />;
  if (!user) return <Redirect to="/login" />;

  // Show language selector if user hasn't picked one yet
  if (!lang) {
    return (
      <LanguageSelector
        onSelect={(selectedLang) => {
          localStorage.setItem("tradebuddy_lang", selectedLang);
          setLang(selectedLang);
        }}
      />
    );
  }

  return <Route path={path} component={Component} />;
}

// Guest-only route — redirects to /analysis if already logged in
function GuestRoute({ component: Component, path }: { component: ComponentType; path: string }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (user) return <Redirect to="/analysis" />;
  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <ProtectedRoute path="/analysis" component={StockAnalysis} />
        <ProtectedRoute path="/briefing" component={MorningBriefing} />
        <ProtectedRoute path="/tracker" component={BigMoneyTracker} />
        <GuestRoute path="/signup" component={SignUp} />
        <GuestRoute path="/login" component={Login} />
        <Route path="/404" component={NotFound} />
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
  const [showPreloader, setShowPreloader] = useState(true);
  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
