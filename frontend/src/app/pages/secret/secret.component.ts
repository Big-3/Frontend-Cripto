import { Component, OnInit } from '@angular/core';
import { Certificate } from '../../shared/models/certificate.model';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CertificateUtils } from 'src/app/shared/utils/certificate-utils.model';

@Component({
  selector: 'app-secret',
  templateUrl: './secret.component.html',
  styleUrls: ['./secret.component.css']
})
export class SecretComponent implements OnInit {
  certificateForm!: FormGroup;
  shareFormer!: FormGroup;
  show: Boolean = false;

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { 
    this.certificateForm = this.formBuilder.group({
      au1: [{value: '', disabled: true}],
      au2: [{value: '', disabled: true}],
      au3: [{value: '', disabled: true}],
      certificate: ['', [Validators.required]]
    });

    this.shareFormer = this.formBuilder.group({
      share1: ['', [Validators.required]],
      share2: ['', [Validators.required]],
      dni: [{value: '', disable: true}]
    });
  }

  ngOnInit(): void {
  }

  getShares(): void{
    if(this.certificateForm.valid){
      const userJSONCerteficate = JSON.parse(this.certificateForm.controls['certificate'].value);
      const userCerteficate: Certificate | undefined = CertificateUtils.genCertificateFromJSON(userJSONCerteficate);
      const safeUserCertificate = userCerteficate!.getSafeJsonCertificate();
      this.http.post('http://localhost:9090/api/get', userJSONCerteficate).toPromise().then(
        (data: any) =>{
          this.certificateForm.controls['au1'].patchValue(data!.share);
          this.http.post('http://localhost:8888/api/get', userJSONCerteficate).toPromise().then(
            (data: any) =>{
              this.certificateForm.controls['au2'].patchValue(data!.share);
              this.http.post('http://localhost:9999/api/get', userJSONCerteficate).toPromise().then(
                (data: any) =>{
                  this.certificateForm.controls['au3'].patchValue(data!.share);
                })
          });
        });
    } else {
      console.log('Emplena camps');
    }
  }

  getDNI(): void{
    if(this.shareFormer.valid){
      const safeShare1 = this.shareFormer.controls['share1'].value;
      const safeShare2 = this.shareFormer.controls['share2'].value;

      this.http.post('http://localhost:8080/api/cert/user', {safeShares: [safeShare1, safeShare2]}).toPromise().then(
        (json: any) => {
          console.log(json);
          this.shareFormer.controls['dni'].patchValue(json.dni);
          this.show = true;
        }
      );
    } else {
      console.log('Emplena camps');
    }
  }
}
