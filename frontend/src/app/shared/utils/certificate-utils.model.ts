import { PrivateCertificate, Certificate } from "../models/certificate.model";
import { hexToBigint, bigintToHex, textToBigint } from "bigint-conversion";
import * as bcu from 'bigint-crypto-utils'
import {RSAPrivateKey, RSAPublicKey} from '@big3/ciber-modules';

export class CertificateUtils {
    constructor() {

    }

    static getJsonSafePubKey(pubKey: RSAPublicKey): any {
        console.log(`GETTING SAFE JSON KEY`);
        var safeKey = {
            e: bigintToHex(pubKey.getExpE()),
            n: bigintToHex(pubKey.getModN())
        };
        return safeKey;
    }

    static genCertificateFromJSON(safeCertificate: any): Certificate | undefined{
        if(typeof safeCertificate === 'undefined'){
            console.log('No valid certificate');
            return undefined;
        } else {
            var {publicKey, serverSignature} = safeCertificate;
            if(typeof publicKey !== 'undefined' && typeof serverSignature !== 'undefined'){
                const pubKey: RSAPublicKey | undefined = this.rsaPubKeyFromHex(publicKey);
                if(typeof pubKey !== 'undefined'){
                    return new Certificate(pubKey, hexToBigint(serverSignature));
                } else {
                    console.log(`No valid certificate ${safeCertificate}`);
                    return undefined;
                }
            } else {
                console.log(`No valid certificate ${safeCertificate}`);
                return undefined;
            }
        }
    }
    
    static genPrivateCertificateFromJSON(safePrivateCertificate: any): PrivateCertificate | undefined{
        if(typeof safePrivateCertificate === 'undefined'){
            console.log('No valid certificate');
            return undefined;
        } else {
            var {privateKey, serverSignature} = safePrivateCertificate;
            if(typeof privateKey !== 'undefined' && typeof serverSignature !== 'undefined'){
                const privKey: RSAPrivateKey | undefined = this.rsaPrivKeyFromHex(privateKey);
                if(typeof privKey !== 'undefined'){
                    return new PrivateCertificate(privKey, hexToBigint(serverSignature));
                } else {
                    console.log(`No valid certificate ${safePrivateCertificate}`);
                    return undefined;
                }
            } else {
                console.log(`No valid certificate ${safePrivateCertificate}`);
                return undefined;
            }
        }
    }

    static rsaPubKeyFromHex(jsonSafeKey: any): RSAPublicKey | undefined{
        const {e, n} = jsonSafeKey;
        if(typeof e === 'undefined' || typeof n === 'undefined'){
            return undefined;
        } else {
            return new RSAPublicKey(hexToBigint(e), hexToBigint(n));
        }
    }

    static rsaPrivKeyFromHex(jsonSafeKey: any): RSAPrivateKey | undefined{
        const {d, pubKey} = jsonSafeKey;
        if(typeof d === 'undefined' || typeof pubKey === 'undefined'){
            return undefined;
        } else {
            const publicKey: RSAPublicKey | undefined = this.rsaPubKeyFromHex(pubKey);
            if(typeof publicKey !== 'undefined')
                return new RSAPrivateKey(hexToBigint(d), publicKey);
            else
                return undefined;
        }
    }

    static blind(m: bigint, pubKey: RSAPublicKey, r: bigint): bigint{
        const bm = m * bcu.modPow(r, pubKey.getExpE(), pubKey.getModN());
        return bm
    }

    static unblind(signedBlindedMessage: bigint, pubKey: RSAPublicKey, r: bigint): bigint {
        const s = signedBlindedMessage*bcu.modInv(r, pubKey.getModN());
        return s
    }
}
