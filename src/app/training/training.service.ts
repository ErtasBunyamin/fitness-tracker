import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Subject, Subscription } from "rxjs";
import { Exercise } from "./exercise.model";
@Injectable() //for inject provider auto
export class TrainingService {
    exerciseChange = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();
    
    private firebaseSubs: Subscription[] = [];
    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;

    constructor(private db: AngularFirestore) { }

    startExercise(selectedId: string) {
        this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
        this.exerciseChange.next({ ...this.runningExercise });
    }

    completeExercise() {
        this.addDataToDatabase({
            ...this.runningExercise,
            date: new Date(),
            state: 'completed'
        });
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }

    cancelExercise(progress: number) {
        this.addDataToDatabase({
            ...this.runningExercise,
            duration: this.runningExercise.duration * (progress / 100),
            calories: this.runningExercise.calories * (progress / 100),
            date: new Date(),
            state: 'cancelled'
        });
        this.runningExercise = null;
        this.exerciseChange.next(null);
    }

    fetchAvailableExercises() {
        this.firebaseSubs.push(this.db
            .collection('availableExercises')
            .snapshotChanges()
            .map(docArray => {
                return docArray.map(doc => {
                    return {
                        id: doc.payload.doc.id,
                        ...doc.payload.doc.data() as Exercise
                    };
                });
            })
            .subscribe((exercises: Exercise[]) => {
                
                this.availableExercises = exercises;
                this.exercisesChanged.next([...this.availableExercises]);
            })
        );
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }

    fetchCompletedOrCanceledExercises() {
        this.firebaseSubs.push(this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: any[]) => {
                //console.log(exercises);//there is multi call issue
                this.finishedExercisesChanged.next(exercises);
            })
        );
    }

    cancelSubscriptions() {
        this.firebaseSubs.forEach(sub => sub.unsubscribe());
    }

    getRunningExercise() {
        return { ...this.runningExercise };
    }
}