// FitForge Main App Component - Production Ready
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/Dashboard';
import { WorkoutGenerator } from '@/components/workout/WorkoutGenerator';
import { RecipeGenerator } from '@/components/nutrition/RecipeGenerator';
import { ProgressTracker } from '@/components/progress/ProgressTracker';
import { 
  Dumbbell, 
  Home, 
  Target, 
  ChefHat, 
  TrendingUp,
  Menu,
  X,
  LogOut
} from 'lucide-react';

type PageType = 'dashboard' | 'workouts' | 'nutrition' | 'progress';

export const FitForgeApp = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Debug log for authentication state
  console.log('FitForgeApp render - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);

  // Monitor authentication changes
  useEffect(() => {
    console.log('Auth state effect - isAuthenticated:', isAuthenticated);
    // If user becomes authenticated, ensure we're on dashboard
    if (isAuthenticated && user) {
      console.log('User authenticated, setting current page to dashboard');
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, user]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: ChefHat },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'workouts': return <WorkoutGenerator />;
      case 'nutrition': return <RecipeGenerator />;
      case 'progress': return <ProgressTracker />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="p-3 bg-primary/10 rounded-full">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground">Loading FitForge...</p>
        </motion.div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left space-y-6"
          >
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-full">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FitForge
              </h1>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Fitness Journey
              </span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-lg">
              Transform your fitness goals into reality with personalized AI workouts, 
              smart nutrition planning, and intelligent progress tracking designed for sustainable success.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <Card className="p-4 border-primary/20">
                <div className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">AI Workout Plans</h3>
                    <p className="text-sm text-muted-foreground">Personalized to your goals</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 border-secondary/20">
                <div className="flex items-center space-x-3">
                  <ChefHat className="h-6 w-6 text-secondary" />
                  <div>
                    <h3 className="font-semibold">Smart Nutrition</h3>
                    <p className="text-sm text-muted-foreground">Healthy recipes & tracking</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Auth Forms */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {showSignup ? (
                <SignupForm
                  key="signup"
                  onSwitchToLogin={() => setShowSignup(false)}
                />
              ) : (
                <LoginForm
                  key="login"
                  onSwitchToSignup={() => setShowSignup(true)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main App Interface
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FitForge
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  onClick={() => setCurrentPage(item.id as PageType)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.fitnessLevel}</p>
              </div>
              
              <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex">
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-border py-4"
              >
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "default" : "ghost"}
                      onClick={() => {
                        setCurrentPage(item.id as PageType);
                        setShowMobileMenu(false);
                      }}
                      className="w-full justify-start space-x-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <Button
                      variant="ghost"
                      onClick={logout}
                      className="w-full justify-start space-x-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};