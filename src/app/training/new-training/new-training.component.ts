import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from "@angular/fire/compat/firestore";

import { Exercise } from '../exercise.model';
import { TrainingService } from '../training.service';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  selectedExercise: string;
  exerciseSubscription = new Subscription();
  exercises: Exercise[];

  constructor(private trainingService: TrainingService, private db: AngularFirestore) {

  }

  ngOnInit(): void {
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(
      exercises => (this.exercises = exercises)
    );
    this.trainingService.fetchAvailableExercises();
    
  }

  ngOnDestroy() {
    this.exerciseSubscription.unsubscribe();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
