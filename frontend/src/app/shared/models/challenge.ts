import { bigintToHex } from "bigint-conversion";

export class Challenge {
    private _clearText: string;
    private _challengeText: bigint;

    constructor (clearText: string, challengeText: bigint) {
        this._challengeText = challengeText;
        this._clearText = clearText;
    }

    getClearText(): string{
        return this._clearText;
    }

    getChallengeText(): bigint{
        return this._challengeText;
    }

    getSafeChallengeText(): string {
        return bigintToHex(this._challengeText);
    }
}
