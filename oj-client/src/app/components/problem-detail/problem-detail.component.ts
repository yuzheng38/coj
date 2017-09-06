import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Problem } from '../../data-structure/problem';

@Component({
  selector: 'app-problem-detail',
  templateUrl: './problem-detail.component.html',
  styleUrls: ['./problem-detail.component.css']
})
export class ProblemDetailComponent implements OnInit {
  problem: Problem;

  constructor(
    private route: ActivatedRoute,
    @Inject('data') private dataService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((param: Params) => {
      // this.problem = this.dataService.getProblem(+param['id']);
      this.dataService.getProblem(+param['id'])
        .then(problem => this.problem = problem);
    });
  }

}
