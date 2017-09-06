import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';

import { Problem } from '../data-structure/problem';
import { UserCode } from '../data-structure/user-code';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class DataService {
  private _problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private http: Http) { }

  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
      .toPromise()
      .then((res: Response) => {
        this._problemSource.next(res.json());
      })
      .catch(this.handleError);
    return this._problemSource.asObservable();
  }

  getProblem(id: number){
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res.json();
      })
      .catch(this.handleError);
  }

  addProblem(newProblem: Problem) {
    const headers = new Headers({'content-type': 'application/json'});
    return this.http.post('/api/v1/problems', newProblem, headers)
      .toPromise()
      .then((res: Response) => res.json())
      .catch(this.handleError);
  }

  repl(codes: UserCode): Promise<any>{
    const header = new Headers({'content-type': 'application/json'});
    return this.http.post('api/v1/repl', codes, header)
      .toPromise()
      .then((res: Response) => {
        console.log('client side repl ', res);
        return res.json();
      })
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error);
  }
}
