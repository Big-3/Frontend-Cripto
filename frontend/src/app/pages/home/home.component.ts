import { Component, OnInit } from '@angular/core';
import { Certificate, PrivateCertificate } from '../../shared/models/certificate.model';
import { CertificateService } from 'src/app/shared/services/certificate.service';
import {generateRSAKeys, RSAPublicKey, RSAPrivateKey} from '@big3/ciber-modules';
import { CertificateUtils } from 'src/app/shared/utils/certificate-utils.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as bigintConversion from 'bigint-conversion';
import * as bcu from 'bigint-crypto-utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  generarForm!: FormGroup;
  private privKey: RSAPrivateKey;
  private serverKey: RSAPublicKey | undefined;

  constructor(private formBuilder: FormBuilder, private certService: CertificateService) { 
    this.privKey = new RSAPrivateKey(BigInt(0), new RSAPublicKey(BigInt(0), BigInt(0)));
  }

  ngOnInit(): void {
    this.generarForm = this.formBuilder.group({
      pubKey: [{value: '', disabled: true}],
      privKey: [{value: '', disabled: true}],
      modulus: [{value: '', disabled: true}],
      dni: ['', [Validators.required]]
    });

    this.certService.getServerPublicKey().then(
      (json) => {
        console.log(`Rebuda Clau del Servidor`);
        this.serverKey = CertificateUtils.rsaPubKeyFromHex(json.safePublicKey);
        if (typeof this.serverKey === 'undefined')
          console.log(`Hi ha hagut algun problema amb la clau: ${json}`);
      }
    );
  }

  generarClaus(){
    if(typeof this.serverKey !== 'undefined'){
      if(this.generarForm.valid){
        generateRSAKeys().then(
          (value) => {
            this.privKey = value;
            this.generarForm.controls['privKey'].patchValue(bigintConversion.bigintToHex(this.privKey.getExpD()));
            this.generarForm.controls['pubKey'].patchValue(bigintConversion.bigintToHex(this.privKey.getRSAPublicKey().getExpE()));
            this.generarForm.controls['modulus'].patchValue(bigintConversion.bigintToHex(this.privKey.getRSAPublicKey().getModN()));

            const dni: string = this.generarForm.controls['dni'].value;
            const r: bigint = bcu.randBetween(this.serverKey!.getModN(), BigInt(1));
            const dniBlinded = bigintConversion.bigintToHex(CertificateUtils.blind(bigintConversion.textToBigint(dni), this.serverKey!, r)); 

            const jsonBody = {
              pubRawKey: CertificateUtils.getJsonSafePubKey(this.privKey.getRSAPublicKey()),
              dni: dni,
              blindCipher: dniBlinded
            }

            this.certService.postIssueCertificate(jsonBody).then(
              (json) => {
                console.log(`Rebut resposta ${json}`);
                const userCertificate: Certificate | undefined = CertificateUtils.genCertificateFromJSON(json);
                if(typeof userCertificate !== 'undefined'){
                  console.log('Certificat Creat correctament');
                  const unblindedDni = CertificateUtils.unblind(userCertificate.getServerSignature(), this.serverKey!, r);
                  const verificated = bigintConversion.bigintToText(this.serverKey!.verify(unblindedDni));
                  console.log(`Comparant ${dni} amb ${verificated}`);
                  if (verificated == dni){
                    console.log('El certificat és vàlid');  
                  } else {
                    console.log('El certificat no és vàlid');
                  }
                }
              }
            );
          });
      } else {
        console.log('EMPLENA EL DNI.');
      }
    }
  }
}
