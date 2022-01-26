import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private url: string = "http://localhost:8080/api";

  constructor(private http: HttpClient) { }

  getServerPublicKey(): Promise<any>{
    return this.http.get(this.url + '/public/key').toPromise();
  }

  postIssueCertificate(json: any): Promise<any>{
    return this.http.post(this.url + '/cert/issue', json).toPromise();
  }
}
