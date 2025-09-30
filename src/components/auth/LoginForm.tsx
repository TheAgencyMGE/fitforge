// FitForge Login Form - Production Ready
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { firestoreService } from '@/services/firestoreService';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
}

export const LoginForm = ({ onSwitchToSignup }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isLoading, getDemoAccounts, createDemoAccounts } = useAuth();
  const { toast } = useToast();

  const demoAccounts = getDemoAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const response = await login({ email, password });
    
    console.log('Login form - response:', response); // Debug log
    
    if (response.success) {
      toast({
        title: "Welcome to FitForge! 💪",
        description: "Ready to start your fitness journey?",
      });
      console.log('Login successful, user should be redirected automatically'); // Debug log
    } else {
      setError(response.error || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    const response = await login({ email: demoEmail, password: 'demo123' });
    console.log('Demo login - response:', response);
    if (response.success) {
      toast({
        title: "Demo Login Successful! 🎯",
        description: "Exploring FitForge with demo account",
      });
      console.log('Demo login successful, user should be redirected automatically');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await firestoreService.createInitialData('');
        console.log('Initial data created');
      } catch (error) {
        console.log('Initial data already exists or error:', error);
      }
    };

    initializeData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="fitness-card border-primary/20">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="p-3 bg-primary/10 rounded-full">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue your fitness journey</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Accounts Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Try demo accounts:</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={createDemoAccounts}
                disabled={isLoading}
                className="text-xs"
              >
                Create Demos
              </Button>
            </div>
            <div className="space-y-2">
              {demoAccounts.map((account, index) => (
                <Button
                  key={account.id}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => handleDemoLogin(account.email)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      account.fitnessLevel === 'beginner' ? 'bg-green-500' :
                      account.fitnessLevel === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{account.name}</span>
                    <span className="text-xs text-muted-foreground">({account.fitnessLevel})</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button variant="link" onClick={onSwitchToSignup} className="text-primary">
              Don't have an account? Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};