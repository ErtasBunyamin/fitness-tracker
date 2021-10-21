import { Subject } from "rxjs";
import { Exercise } from "./exercise.model";

export class TrainingService {
    exerciseChange = new Subject<Exercise>();
    private availableExercises: Exercise[] = [
        { id: 'crunches', name: 'Crunches', duration: 30, calories: 8 },
        { id: 'touch-toes', name: 'Touch Toes', duration: 180, calories: 15 },
        { id: 'side-lunges', name: 'Side Lunges', duration: 120, calories: 18 },
        { id: 'burpees', name: 'Burpees', duration: 60, calories: 8 },
    ];
    private runningExercise: Exercise;
    private exercises: Exercise[] = [];

    startExercise(selectedId: string) {
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChange.next({ ...this.runningExercise });
    }

    completeExercise() {
        this.exercises.push({
            ...this.runningExercise, 
            date: new Date(), 
            state: 'completed'
        });
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }

    cancelExercise(progress: number) {
        this.exercises.push({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories / (this.runningExercise.duration * (progress / 100)),
            date: new Date(), 
            state: 'cancelled'
        });
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }



    getAvailableExercises() {
        return this.availableExercises.slice();
    }

    getRunningExercise() {
        return { ...this.runningExercise };
    }
}