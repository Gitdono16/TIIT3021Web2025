import crypto from "crypto";

function getKey() {
    const b64 = process.env.TOKEN_ENC_KEY;
    if (!b64) throw new Error("TOKEN_ENC_KEY manquant");
    const key = Buffer.from(b64, "base64");
    if (key.length !== 32) throw new Error("TOKEN_ENC_KEY doit faire 32 octets");
    return key;
}

export function encryptToken(plain: string) {
    const key = getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString("base64"),
        data: ciphertext.toString("base64"),
        tag: tag.toString("base64"),
    };
}

export function decryptToken(payload: { iv: string; data: string; tag: string }) {
    const key = getKey();
    const iv = Buffer.from(payload.iv, "base64");
    const data = Buffer.from(payload.data, "base64");
    const tag = Buffer.from(payload.tag, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
    return plain;
}
