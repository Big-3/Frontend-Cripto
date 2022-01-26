import { bigintToHex, bigintToText } from "bigint-conversion";
import { RSAPrivateKey, RSAPublicKey } from "@big3/ciber-modules";

export class Certificate {
    private _pubKey : RSAPublicKey;
    private _serverSignature : bigint;

    constructor (pubKey: RSAPublicKey, serverSignature: bigint) {
        this._pubKey = pubKey;
        this._serverSignature = serverSignature;
    }

    getSafeJsonCertificate(): any {
        var safeCertificate = {
            safePublicKey: this.getJsonSafePubKey(),
            serverSignature: this.getJsonSafeServerSignature()
        };
        return safeCertificate;
    }

    getJsonSafePubKey(): any {
        var safeKey = {
            e: bigintToHex(this._pubKey.getExpE()),
            n: bigintToHex(this._pubKey.getModN())
        }
        return safeKey;
    }

    getPubKey(): RSAPublicKey{
        return this._pubKey;
    }

    getJsonSafeServerSignature(): any {
        var safeSignature = bigintToHex(this._serverSignature);
        return safeSignature;
    }

    getServerSignature(): bigint{
        return this._serverSignature;
    } 

}

export class PrivateCertificate extends Certificate{
    private _privKey: RSAPrivateKey;

    constructor(privKey: RSAPrivateKey, serverSignature: bigint) {
        super(privKey.getRSAPublicKey(), serverSignature);
        this._privKey = privKey;
    }

    getJsonSafePrivKey(): any {
        this._privKey.getExpD();
        
        var safePrivKey = {
            d: bigintToHex(this._privKey.getExpD()),
            pubKey: this.getJsonSafePubKey()
        };
        return safePrivKey;
    }

    getJsonSafePrivateCertificate(): any{
        var safePrivateCertificate = {
            certificate: this.getSafeJsonCertificate(),
            privKey: this.getJsonSafePrivKey()
        };

        return safePrivateCertificate;
    }
}