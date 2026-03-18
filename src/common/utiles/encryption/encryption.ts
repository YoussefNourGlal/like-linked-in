import crypto from "node:crypto";
const myKey = Buffer.from("12345678901234567890123456789012");

export let encryption= function(data:any){
    let iv=crypto.randomBytes(16);
    let crypt=crypto.createCipheriv("aes-256-cbc",myKey,iv);
    let cryptData=crypt.update(data,"utf-8","hex");
    cryptData=cryptData+crypt.final("hex");
    return iv.toString("hex") + ":" +cryptData;
}

export let decryption= function(encryptdata:any){
    let[iv,cipherText]=encryptdata.split(":");
     iv=Buffer.from(iv,"hex")
    let decrypt=crypto.createDecipheriv("aes-256-cbc",myKey,iv);
    let decryptData=decrypt.update(cipherText,"hex","utf-8");
    decryptData=decryptData+decrypt.final("utf-8");
    return decryptData;
}