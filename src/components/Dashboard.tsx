import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useFitForgeAI } from '@/hooks/useFitForgeAI';
import { useDashboardStats, useProgressMetrics, useWorkoutPlans } from '@/hooks/useFirestore';
import {
  Dumbbell,
  Target,
  Calendar,
  TrendingUp,
  Apple,
  Flame,
  Trophy,
  Clock,
  Activity,
  Heart
} from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: 'dashboard' | 'workouts' | 'nutrition' | 'progress') => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { user, logout } = useAuth();
  const { generateMotivation, motivationLoading } = useFitForgeAI();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { latestMetrics } = useProgressMetrics();
  const { workoutPlans, loading: plansLoading } = useWorkoutPlans();
  const [motivationalMessage, setMotivationalMessage] = useState('');

  useEffect(() => {
    if (user && !statsLoading) {
      generateMotivation({
        userName: user.name,
        currentStreak: stats.workoutStreak,
        recentProgress: stats.workoutStreak > 0 ? 'Great consistency this week' : 'Let\'s get back on track',
        mood: 8
      }).then(message => {
        if (message) setMotivationalMessage(message);
      });
    }
  }, [user, generateMotivation, stats, statsLoading]);

  const quickActions = [
    {
      title: 'Start Workout',
      description: 'Begin today\'s training session',
      icon: Dumbbell,
      gradient: 'from-strength to-strength/80',
      action: () => onNavigate?.('workouts')
    },
    {
      title: 'Log Meal',
      description: 'Track your nutrition',
      icon: Apple,
      gradient: 'from-nutrition to-nutrition/80',
      action: () => onNavigate?.('nutrition')
    },
    {
      title: 'View Progress',
      description: 'Check your achievements',
      icon: TrendingUp,
      gradient: 'from-primary to-primary/80',
      action: () => onNavigate?.('progress')
    },
    {
      title: 'Plan Schedule',
      description: 'Organize upcoming workouts',
      icon: Calendar,
      gradient: 'from-secondary to-secondary/80',
      action: () => onNavigate?.('workouts')
    }
  ];

  // Get the most recent workout plan
  const currentWorkoutPlan = workoutPlans && workoutPlans.length > 0 ? workoutPlans[0] : null;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
              <p className="text-white/80">Ready to crush your fitness goals today?</p>
            </motion.div>
            
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={logout}
            >
              Logout
            </Button>
          </div>

          {/* Motivational Message */}
          {motivationalMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm"
            >
              <p className="text-white/90 italic">💪 {motivationalMessage}</p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="fitness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Workout Streak</p>
                  <p className="text-2xl font-bold text-primary">{stats.workoutStreak}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fitness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                  <p className="text-2xl font-bold text-secondary">{stats.totalWorkouts}</p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fitness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Calories Burned</p>
                  <p className="text-2xl font-bold text-accent">{stats.caloriesBurned.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-full">
                  <Activity className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="fitness-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Goal</p>
                  <p className="text-2xl font-bold text-primary">{stats.weeklyGoalProgress}%</p>
                  <Progress value={stats.weeklyGoalProgress} className="mt-2" />
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Workout Plans */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="fitness-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  <span>Your Workout Plans</span>
                </CardTitle>
                <CardDescription>
                  {currentWorkoutPlan ? 'Your current training plan' : 'Create your first workout plan'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plansLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
                    <span className="text-muted-foreground">Loading your plans...</span>
                  </div>
                ) : currentWorkoutPlan ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{currentWorkoutPlan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{currentWorkoutPlan.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{currentWorkoutPlan.duration_weeks} weeks</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4" />
                            <span>{currentWorkoutPlan.workouts_per_week}x per week</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {user?.fitnessLevel}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                        onClick={() => onNavigate?.('workouts')}
                      >
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Start Today's Workout
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onNavigate?.('workouts')}
                      >
                        View Plan
                      </Button>
                    </div>

                    {currentWorkoutPlan.target_goals && currentWorkoutPlan.target_goals.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {currentWorkoutPlan.target_goals.map((goal, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No workout plans yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first AI-generated workout plan</p>
                    <Button
                      className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      onClick={() => onNavigate?.('workouts')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Create Workout Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="fitness-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to key features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={action.title}
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 hover:bg-muted/50"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-md bg-gradient-to-r ${action.gradient} mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};