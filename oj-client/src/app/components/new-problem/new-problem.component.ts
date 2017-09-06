import { Component, OnInit, Inject } from '@angular/core';
import { Problem } from 'app/data-structure/problem';

// Object.freeze - freezes the properties, i.e. object itself.
// const - freezes the binding. Similar to final in java. The reference is final, but NOT the object itself. 
const DEFAULT_PROBLEM: Problem = Object.freeze({
  id: 0,
  name: '',
  desc: '',
  difficulty: 'easy'
});

@Component({
  selector: 'app-new-problem',
  templateUrl: './new-problem.component.html',
  styleUrls: ['./new-problem.component.css']
})

export class NewProblemComponent implements OnInit {
  // shallow copy
  newProblem: Problem = Object.assign({}, DEFAULT_PROBLEM);
  difficulties: string[] = ['easy', 'medium', 'hard', 'super hard'];
  constructor(
    @Inject('data') private dataService
  ) { }

  ngOnInit() {
  }

  addProblem(): void {
    this.dataService.addProblem(this.newProblem)
      .catch(error => console.log(error.body));
    this.newProblem = Object.assign({}, DEFAULT_PROBLEM);
  }

}
