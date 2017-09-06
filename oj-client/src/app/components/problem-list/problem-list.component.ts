import { Component, OnInit, Inject } from '@angular/core';
import { Problem } from 'app/data-structure/problem';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  problems: Problem[] = [];
  constructor(@Inject('data') private dataService) { }

  ngOnInit() {
    this.getProblems();
  }

  getProblems(): void {
    // this.problems = this.dataService.getProblems();
    this.dataService.getProblems()  // this returns an observable.. so we need to sub..
      .subscribe(problems => this.problems = problems); // automatic update.
  }

}
