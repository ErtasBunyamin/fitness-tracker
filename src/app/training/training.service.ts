import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Store } from "@ngrx/store";
import { Subject, Subscription } from "rxjs";
import { map, take } from "rxjs/operators";

import { Exercise } from "./exercise.model";
import { UIService } from "../shared/ui.service";
import * as fromTraining from "./training.reducer";
import * as Training from "./training.actions";
import * as UI from "../shared/ui.actions";
@Injectable() //for inject provider auto
export class TrainingService {
    exerciseChange = new Subject<Exercise>();
    exercisesChanged = new Subject<Exercise[]>();
    finishedExercisesChanged = new Subject<Exercise[]>();

    private firebaseSubs: Subscription[] = [];
    private runningExercise: Exercise;

    constructor(private db: AngularFirestore, private store: Store<fromTraining.State>, private uiService: UIService) { }

    startExercise(selectedId: string) {
        this.store.dispatch(new Training.StartTraining(selectedId));
    }

    completeExercise() {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDataToDatabase({
                ...ex,
                date: new Date(),
                state: 'completed'
            });
            this.store.dispatch(new Training.StopTraining());
        });
    }

    cancelExercise(progress: number) {
        this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe(ex => {
            this.addDataToDatabase({
                ...ex,
                duration: ex.duration * (progress / 100),
                calories: ex.calories * (progress / 100),
                date: new Date(),
                state: 'cancelled'
            });
            this.store.dispatch(new Training.StopTraining());
        });
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
                this.store.dispatch(new Training.SetAvailableTrainings(exercises));
            }, error => {
                this.store.dispatch(new UI.StopLoading());
                this.store.dispatch(new Training.SetAvailableTrainings([]));
                this.uiService.showSnackbar('Fetching Exercises failed, please try again later.', null, 3000);
            }));
    }


    fetchCompletedOrCanceledExercises() {
        this.firebaseSubs.push(this.db
            .collection('finishedExercises')
            .valueChanges()
            .subscribe((exercises: any[]) => {
                //console.log(exercises);//there is multi call issue
                this.store.dispatch(new Training.SetFinishedTrainings(exercises));
            })
        );
    }

    private addDataToDatabase(exercise: Exercise) {
        this.db.collection('finishedExercises').add(exercise);
    }

    cancelSubscriptions() {
        this.firebaseSubs.forEach(sub => sub.unsubscribe());
    }
}