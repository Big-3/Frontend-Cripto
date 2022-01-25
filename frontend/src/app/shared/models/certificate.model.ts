import { bigintToHex } from "bigint-conversion";
import { RSAPrivateKey, RSAPublicKey } from "Moduls-Ciber/src/ts/RSA";
import { Logger } from "tslog";

export class Certificate {
    private _pubKey : RSAPublicKey;
    private _serverSignature : bigint;
    private _logger: Logger;

    constructor (pubKey: RSAPublicKey, serverSignature: bigint) {
        this._pubKey = pubKey;
        this._serverSignature = serverSignature;
        this._logger = new Logger();
    }

    getSafeJsonCertificate(): any {
        this._logger.info(`Getting JSON safe Certificate`);
        var safeCertificate = {
            publicKey: this.getJsonSafePubKey(),
            serverSignature: this.getJsonSafeServerSignature()
        };
        return safeCertificate;
    }

    getJsonSafePubKey(): any {
        this._logger.info(`GETTING SAFE JSON KEY`);
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
        this._logger.info(`GETTING SAFE JSON SIGNATURE`);
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
            
        }
    }

    getJsonSafePrivateCertificate(): any{
        var safePrivateCertificate = {
            pubKey: this.getJsonSafePubKey(),
            privKey: 
        } 
    }
}