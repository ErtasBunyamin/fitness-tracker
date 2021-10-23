import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Store } from "@ngrx/store";
import { Subject, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { Exercise } from "./exercise.model";
import { UIService } from "../shared/ui.service";
import * as fromRoot from "../app.reducer";
import * as UI from "../shared/ui.actions";
@Injectable() //for inject provider auto
export class TrainingService {
    exerciseChange = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private firebaseSubs: Subscription[] = [];
    private availableExercises: Exercise[] = [];
    private runningExercise: Exercise;

    constructor(private db: AngularFirestore, private store: Store<fromRoot.State>, private uiService: UIService) { }

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
        this.store.dispatch(new UI.StartLoading());
        this.firebaseSubs.push(this.db
            .collection('availableExercises')
            .snapshotChanges()
            .pipe(map(docArray => {
                return docArray.map(doc => {
                    return {
                        id: doc.payload.doc.id,
                        ...doc.payload.doc.data() as Exercise
                    };
                });
            }))
            .subscribe((exercises: Exercise[]) => {
                this.store.dispatch(new UI.StopLoading());
                this.availableExercises = exercises;
                this.exercisesChanged.next([...this.availableExercises]);
            }, error => {
                this.store.dispatch(new UI.StopLoading());
                this.uiService.showSnackbar('Fetching Exercises failed, please try again later.', null, 3000);
                this.exerciseChange.next(null);
            }));
    }


    fetchCompletedOrCanceledExercises() {
        this.store.dispatch(new UI.StartLoading());
        this.firebaseSubs.push(this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: any[]) => {
                //console.log(exercises);//there is multi call issue
                this.store.dispatch(new UI.StopLoading());
                this.finishedExercisesChanged.next(exercises);
            })
        );
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }
    cancelSubscriptions() {
        this.firebaseSubs.forEach(sub => sub.unsubscribe());
    }

    getRunningExercise() {
        return { ...this.runningExercise };
    }
}