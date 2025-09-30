// FitForge Workout Generator - Production Ready
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFitForgeAI } from '@/hooks/useFitForgeAI';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutPlans } from '@/hooks/useFirestore';
import type { WeeklySchedule, WorkoutDay, WorkoutPlan } from '@/types/fitness';
import { 
  Dumbbell, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Zap,
  Heart,
  Repeat
} from 'lucide-react';

export const WorkoutGenerator = () => {
  const { user } = useAuth();
  const { generateWorkout, workoutLoading, workoutError } = useFitForgeAI();
  const { workoutPlans, saveWorkoutPlan, loading: savingPlan } = useWorkoutPlans();
  const { toast } = useToast();
  const [generatedSchedule, setGeneratedSchedule] = useState<WeeklySchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const handleGenerateWorkout = async () => {
    if (!user) return;

    setIsGenerating(true);

    // Provide defaults for missing user data
    const userGoals = user.goals?.length > 0 ? user.goals : ['general fitness'];
    const userEquipment = user.equipment?.length > 0 ? user.equipment : ['bodyweight'];
    const userLimitations = user.limitations || [];
    const workoutDays = user.preferences?.workoutDays?.length || 3;

    const schedule = await generateWorkout({
      fitnessLevel: user.fitnessLevel || 'beginner',
      goals: userGoals,
      availableDays: workoutDays,
      equipment: userEquipment,
      limitations: userLimitations
    });

    if (schedule) {
      setGeneratedSchedule(schedule);
      toast({
        title: "Workout Plan Generated! 🎯",
        description: "Your personalized fitness schedule is ready",
      });
    }

    setIsGenerating(false);
  };

  const handleSaveWorkoutPlan = async () => {
    if (!user || !generatedSchedule) return;

    const workoutPlan: Omit<WorkoutPlan, 'id' | 'userId'> = {
      name: `AI Generated Plan - ${new Date().toLocaleDateString()}`,
      description: `Personalized workout plan for ${user.fitnessLevel || 'beginner'} level`,
      duration_weeks: 4,
      workouts_per_week: user.preferences?.workoutDays?.length || 3,
      target_goals: user.goals?.length > 0 ? user.goals : ['general fitness'],
      created_at: new Date(),
      weekly_schedule: generatedSchedule
    };

    try {
      const planId = await saveWorkoutPlan(workoutPlan);

      if (planId) {
        setCurrentPlanId(planId);
        toast({
          title: "Workout Plan Saved! 💾",
          description: "Your personalized plan has been saved to your profile",
        });
      } else {
        toast({
          title: "Save Failed",
          description: "Failed to save workout plan. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving workout plan:', error);
      toast({
        title: "Save Error",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="h-4 w-4" />;
      case 'cardio': return <Heart className="h-4 w-4" />;
      case 'flexibility': return <Zap className="h-4 w-4" />;
      case 'recovery': return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'workout-type-strength';
      case 'cardio': return 'workout-type-cardio';
      case 'flexibility': return 'workout-type-nutrition';
      case 'recovery': return 'workout-type-recovery';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
        <h1 className="text-3xl font-bold text-primary mb-2">AI Workout Generator</h1>
        <p className="text-muted-foreground">Get a personalized workout plan tailored to your goals</p>
      </motion.div>

      {/* Saved Workout Plans */}
      {workoutPlans && workoutPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="fitness-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Your Saved Plans</span>
              </CardTitle>
              <CardDescription>Your previously generated workout plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {workoutPlans.slice(0, 3).map((plan, index) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>{plan.duration_weeks} weeks</span>
                        <span>•</span>
                        <span>{plan.workouts_per_week}x/week</span>
                        <span>•</span>
                        <span>{new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Use Plan
                      </Button>
                    </div>
                  </div>
                ))}
                {workoutPlans.length > 3 && (
                  <Button variant="ghost" className="w-full">
                    View All Plans ({workoutPlans.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="fitness-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Your Fitness Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fitness Level</p>
                <Badge variant="secondary" className="capitalize mt-1">
                  {user.fitnessLevel || 'beginner'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Workout Days</p>
                <p className="font-medium">{user.preferences?.workoutDays?.length || 3} days/week</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipment</p>
                <p className="font-medium">{user.equipment?.length || 1} items</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goals</p>
                <p className="font-medium">{user.goals?.length || 1} goals</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Primary Goals:</p>
              <div className="flex flex-wrap gap-2">
                {(user.goals?.length > 0 ? user.goals : ['general fitness']).map((goal, index) => (
                  <Badge key={index} variant="outline" className="capitalize">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center"
      >
        <Button
          onClick={handleGenerateWorkout}
          disabled={workoutLoading || isGenerating}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-8 py-6 text-lg"
        >
          {workoutLoading || isGenerating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
              />
              Generating Your Plan...
            </>
          ) : (
            <>
              <Dumbbell className="h-5 w-5 mr-3" />
              Generate My Workout Plan
            </>
          )}
        </Button>
      </motion.div>

      {/* Error Display */}
      {workoutError && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{workoutError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Generated Schedule */}
      {generatedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">Your Personal Workout Schedule</h2>
            <p className="text-muted-foreground">AI-generated plan based on your profile and goals</p>
          </div>

          <div className="grid gap-6">
            {Object.entries(generatedSchedule).map(([dayKey, workout]: [string, WorkoutDay], index) => (
              <motion.div
                key={dayKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Card className="fitness-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="capitalize">{workout.day}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getWorkoutTypeColor(workout.workout_type)}>
                          {getWorkoutTypeIcon(workout.workout_type)}
                          <span className="ml-1 capitalize">{workout.workout_type}</span>
                        </Badge>
                        {workout.duration_minutes > 0 && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {workout.duration_minutes}min
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {workout.exercises.length > 0 && (
                    <CardContent className="space-y-4">
                      {/* Warmup */}
                      {workout.warmup.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">WARMUP</h4>
                          <ul className="text-sm space-y-1">
                            {workout.warmup.map((item, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-secondary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises */}
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">EXERCISES</h4>
                        <div className="grid gap-3">
                          {workout.exercises.map((exercise, idx) => (
                            <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{exercise.name}</h5>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <span>{exercise.sets} sets</span>
                                  <span>•</span>
                                  <span>{exercise.reps} reps</span>
                                  <span>•</span>
                                  <span>{exercise.rest_time} rest</span>
                                </div>
                              </div>
                              
                              {exercise.form_cues.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  <strong>Form tips:</strong> {exercise.form_cues.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cooldown */}
                      {workout.cooldown.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-2">COOLDOWN</h4>
                          <ul className="text-sm space-y-1">
                            {workout.cooldown.map((item, idx) => (
                              <li key={idx} className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-secondary" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {workout.notes && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm">
                            <strong>Coach's Note:</strong> {workout.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  )}

                  {workout.workout_type === 'rest' && (
                    <CardContent>
                      <div className="text-center py-8">
                        <div className="p-4 bg-recovery/10 rounded-full w-fit mx-auto mb-4">
                          <Clock className="h-8 w-8 text-recovery" />
                        </div>
                        <h3 className="font-medium mb-2">Rest & Recovery Day</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Take time to recover and let your muscles repair
                        </p>
                        {workout.notes && (
                          <p className="text-sm bg-muted/30 p-3 rounded-lg">
                            {workout.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center space-x-4"
          >
            <Button variant="outline" onClick={handleGenerateWorkout}>
              <Repeat className="h-4 w-4 mr-2" />
              Generate New Plan
            </Button>
            <Button
              className="bg-gradient-to-r from-secondary to-accent"
              onClick={handleSaveWorkoutPlan}
              disabled={savingPlan || !generatedSchedule}
            >
              {savingPlan ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {currentPlanId ? 'Plan Saved!' : 'Save This Plan'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};