import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats, useProgressMetrics, useWorkoutSessions, useAchievements } from '@/hooks/useFirestore';
import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Scale,
  Ruler,
  Dumbbell,
  Heart,
  Zap,
  Trophy,
  Flame,
  Activity
} from 'lucide-react';

// Mock data - in production this would come from the database
const mockWeightData = [
  { date: '2024-01-01', weight: 75 },
  { date: '2024-01-08', weight: 74.5 },
  { date: '2024-01-15', weight: 74.2 },
  { date: '2024-01-22', weight: 73.8 },
  { date: '2024-01-29', weight: 73.5 },
  { date: '2024-02-05', weight: 73.1 },
  { date: '2024-02-12', weight: 72.8 },
];

const mockStrengthData = [
  { exercise: 'Push-ups', week1: 8, week2: 10, week3: 12, week4: 15 },
  { exercise: 'Squats', week1: 15, week2: 18, week3: 20, week4: 25 },
  { exercise: 'Plank (sec)', week1: 30, week2: 40, week3: 50, week4: 60 },
  { exercise: 'Pull-ups', week1: 2, week2: 3, week3: 4, week4: 6 },
];

const mockWorkoutData = [
  { week: 'Week 1', workouts: 3, calories: 450 },
  { week: 'Week 2', workouts: 4, calories: 620 },
  { week: 'Week 3', workouts: 4, calories: 580 },
  { week: 'Week 4', workouts: 5, calories: 750 },
  { week: 'Week 5', workouts: 4, calories: 680 },
  { week: 'Week 6', workouts: 5, calories: 820 },
];

export const ProgressTracker = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { progressMetrics, latestMetrics, loading: metricsLoading } = useProgressMetrics();
  const { workoutSessions, loading: sessionsLoading } = useWorkoutSessions();
  const { achievements, loading: achievementsLoading } = useAchievements();
  const [activeTab, setActiveTab] = useState('overview');

  const mockAchievements = [
    {
      id: 1,
      title: 'First Week Complete',
      description: 'Completed your first week of workouts',
      icon: Calendar,
      earned: true,
      date: '2024-01-07'
    },
    {
      id: 2,
      title: 'Strength Gains',
      description: 'Increased push-up count by 50%',
      icon: Dumbbell,
      earned: true,
      date: '2024-01-15'
    },
    {
      id: 3,
      title: 'Consistency King',
      description: 'Completed 20 workouts',
      icon: Flame,
      earned: true,
      date: '2024-01-28'
    },
    {
      id: 4,
      title: 'Weight Loss Milestone',
      description: 'Lost 2kg from starting weight',
      icon: Scale,
      earned: false,
      progress: 75
    }
  ];

  // Calculate real statistics from data
  const currentStats = useMemo(() => {
    const defaultWeight = user?.gender === 'male' ? 75 : 65;
    const targetWeight = user?.gender === 'male' ? 70 : 60;

    // Get weight data from progress metrics
    const weightMetrics = progressMetrics
      .filter(metric => metric.weight)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const currentWeight = weightMetrics[0]?.weight || defaultWeight;
    const initialWeight = weightMetrics[weightMetrics.length - 1]?.weight || defaultWeight;
    const weightLoss = Math.max(0, initialWeight - currentWeight);

    // Calculate strength improvement from recent sessions
    const recentSessions = workoutSessions
      .filter(session => session.workout_type === 'strength')
      .slice(-10);

    const strengthImprovement = recentSessions.length > 5 ?
      Math.round(((recentSessions.length - 5) / 5) * 25) : 0;

    return {
      workoutStreak: stats.workoutStreak,
      totalWorkouts: stats.totalWorkouts,
      weightLoss,
      currentWeight,
      targetWeight,
      caloriesBurned: stats.caloriesBurned,
      strengthImprovement
    };
  }, [stats, progressMetrics, workoutSessions, user]);

  // Generate chart data from real metrics
  const weightData = useMemo(() => {
    if (!progressMetrics || progressMetrics.length === 0) {
      return []; // Return empty array instead of mock data
    }

    return progressMetrics
      .filter(metric => metric.weight)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(metric => ({
        date: new Date(metric.date).toLocaleDateString(),
        weight: metric.weight!
      }));
  }, [progressMetrics]);

  const workoutData = useMemo(() => {
    if (!workoutSessions || workoutSessions.length === 0) {
      return []; // Return empty array instead of mock data
    }

    // Group sessions by week
    const weeklyData: { [week: string]: { workouts: number; calories: number } } = {};

    workoutSessions.forEach(session => {
      const date = new Date(session.date);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = `Week ${Math.ceil((Date.now() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { workouts: 0, calories: 0 };
      }

      weeklyData[weekKey].workouts += 1;
      weeklyData[weekKey].calories += session.calories_burned || 0;
    });

    return Object.entries(weeklyData)
      .slice(-6) // Last 6 weeks
      .map(([week, data]) => ({
        week,
        workouts: data.workouts,
        calories: data.calories
      }));
  }, [workoutSessions]);

  const strengthData = useMemo(() => {
    if (!workoutSessions || workoutSessions.length === 0) {
      return []; // Return empty array instead of mock data
    }

    // Extract strength metrics from sessions
    const strengthExercises: { [exercise: string]: number[] } = {};

    workoutSessions
      .filter(session => session.workout_type === 'strength')
      .forEach(session => {
        session.exercises.forEach(exercise => {
          if (!strengthExercises[exercise.name]) {
            strengthExercises[exercise.name] = [];
          }

          const totalReps = exercise.reps_completed.reduce((sum, reps) => sum + reps, 0);
          strengthExercises[exercise.name].push(totalReps);
        });
      });

    return Object.entries(strengthExercises)
      .slice(0, 4) // Top 4 exercises
      .map(([exercise, reps]) => ({
        exercise,
        week1: reps[0] || 0,
        week2: reps[Math.floor(reps.length * 0.25)] || reps[0] || 0,
        week3: reps[Math.floor(reps.length * 0.5)] || reps[0] || 0,
        week4: reps[reps.length - 1] || reps[0] || 0
      }));
  }, [workoutSessions]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-primary mb-2">Progress Tracker</h1>
        <p className="text-muted-foreground">Monitor your fitness journey and celebrate achievements</p>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="fitness-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-primary">{currentStats.workoutStreak}</p>
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
                <p className="text-2xl font-bold text-secondary">{currentStats.totalWorkouts}</p>
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
                <p className="text-sm text-muted-foreground">Weight Progress</p>
                <p className="text-2xl font-bold text-accent">{currentStats.weightLoss.toFixed(1)}kg</p>
                <p className="text-xs text-muted-foreground">lost</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Scale className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="fitness-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calories Burned</p>
                <p className="text-2xl font-bold text-primary">{currentStats.caloriesBurned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Progress Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weight">Weight</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Weight Progress */}
            <Card className="fitness-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>Weight Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Goal Progress</span>
                    <span className="text-sm font-medium">{currentStats.currentWeight}kg / {currentStats.targetWeight}kg</span>
                  </div>
                  <Progress
                    value={0}
                    className="h-2"
                  />
                </div>
                <div className="h-64">
                  {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No weight data yet</h3>
                      <p className="text-muted-foreground">Start tracking your weight to see progress charts</p>
                      <Button className="mt-4" variant="outline">
                        Log Weight
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Workout Activity */}
            <Card className="fitness-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-secondary" />
                  <span>Workout Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {workoutData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workoutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="workouts" fill="hsl(var(--secondary))" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No workout data yet</h3>
                      <p className="text-muted-foreground">Complete your first workout to see activity charts</p>
                      <Button className="mt-4" variant="outline">
                        Start Workout
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weight" className="space-y-6">
            <Card className="fitness-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Scale className="h-5 w-5 text-primary" />
                    <span>Weight Tracking</span>
                  </CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                    Log Weight
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{currentStats.currentWeight}kg</div>
                    <div className="text-sm text-muted-foreground">Current Weight</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{currentStats.targetWeight}kg</div>
                    <div className="text-sm text-muted-foreground">Target Weight</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{currentStats.weightLoss.toFixed(1)}kg</div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </div>
                </div>

                <div className="h-80">
                  {weightData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Start tracking your weight</h3>
                      <p className="text-muted-foreground mb-4">Log your current weight to begin tracking your progress over time</p>
                      <Button className="bg-gradient-to-r from-primary to-secondary">
                        Log Weight
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strength" className="space-y-6">
            <Card className="fitness-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Dumbbell className="h-5 w-5 text-strength" />
                    <span>Strength Progress</span>
                  </CardTitle>
                  <Badge className="bg-strength text-strength-foreground">
                    +{currentStats.strengthImprovement}% improvement
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {strengthData.length > 0 ? (
                  <div className="space-y-6">
                    {strengthData.map((exercise, index) => (
                      <div key={exercise.exercise} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{exercise.exercise}</span>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Week 1: {exercise.week1}</span>
                            <span>→</span>
                            <span className="font-medium text-strength">Week 4: {exercise.week4}</span>
                          </div>
                        </div>
                        <Progress
                          value={exercise.week1 > 0 ? (exercise.week4 / exercise.week1) * 30 : 0} // Normalize for display
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          +{exercise.week1 > 0 ? Math.round(((exercise.week4 - exercise.week1) / exercise.week1) * 100) : 0}% improvement
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No strength data yet</h3>
                    <p className="text-muted-foreground mb-4">Complete strength workouts to track your progress and improvements</p>
                    <Button className="bg-gradient-to-r from-primary to-secondary">
                      Start Strength Training
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading achievements...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <Card className="fitness-card border-secondary/50 bg-secondary/5">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                              <Award className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{achievement.title}</h3>
                                <Badge className="bg-secondary text-secondary-foreground">
                                  <Award className="h-3 w-3 mr-1" />
                                  Earned
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                              <p className="text-xs text-secondary">
                                Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground">Keep working out to earn your first achievement!</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};