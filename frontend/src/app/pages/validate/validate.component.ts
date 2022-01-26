import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Certificate } from '../../shared/models/certificate.model';
import { RSAPrivateKey, RSAPublicKey} from '@big3/ciber-modules';
import { CertificateUtils } from 'src/app/shared/utils/certificate-utils.model';
import { ChallengeService } from 'src/app/shared/services/challenge.service';
import { hexToBigint, bigintToHex, bigintToText } from 'bigint-conversion';


@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.css']
})
export class ValidateComponent implements OnInit {
  validateForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private challangeService: ChallengeService) { 
  }

  ngOnInit(): void {
    this.validateForm = this.formBuilder.group({
      certificat: ['', [Validators.required]],
      privKey: ['', [Validators.required]]
    });
  }

  validarCertificat(): void{
    if(this.validateForm.valid){
      const certJSON = JSON.parse(this.validateForm.controls['certificat'].value);
      console.log(certJSON);
      const cert : Certificate | undefined = CertificateUtils.genCertificateFromJSON(certJSON);

      const d: bigint = hexToBigint(this.validateForm.controls['privKey'].value);
      const privKey: RSAPrivateKey = new RSAPrivateKey(d, cert!.getPubKey());

      const safeCertificate = cert!.getSafeJsonCertificate();
      this.challangeService.getChallenge(safeCertificate).then(
        (json) => {
          const {id, challenge} = json;
          if(typeof id !== 'undefined' || typeof challenge !== 'undefined'){
            const decrypt:bigint = privKey.decrypt(hexToBigint(challenge));
            const decryptedMSG: string = bigintToHex(decrypt);

            const body = {
              id: id,
              decryptedMSG: decryptedMSG
            }

            this.challangeService.verifyChallenge(body).then(
              (json) =>{
                console.log(json.msg);
              }
            );
          } else {
            console.log('bad operation');
          }
        }
      );
    }else{
      console.log('Emplena el camp');
    }
  }

}
