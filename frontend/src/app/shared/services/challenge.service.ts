import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private url: string = "http://localhost:8080/api";

  constructor(private http: HttpClient) { }

  getChallenge(json: any): Promise<any>{
    return this.http.post(this.url + '/validation/instantiate', json).toPromise();
  }

  verifyChallenge(json: any): Promise<any>{
    return this.http.post(this.url + '/validation/validate', json).toPromise();
  }
}
