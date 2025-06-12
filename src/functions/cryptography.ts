import { PUBLIC_KEY } from "@/constants/local-storage";
import { getPublicKey } from "@/services/auth";

function str2ab(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

async function importPubKey() {
    if (!window.crypto || !window.crypto.subtle) {
        console.error("API Crypto não suportada ou contexto inseguro");
        throw new Error("API Crypto não suportada ou contexto inseguro");
    }

    let publicKey = sessionStorage.getItem(window.btoa(PUBLIC_KEY));

    if (!publicKey || !publicKey.length) {
        console.log("Buscando chave pública do servidor");
        publicKey = await getPublicKey();
    }

    const binaryDerString = window.atob(publicKey);
    const binaryDer = str2ab(binaryDerString);

    console.log("Importing public key");
    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"],
    );
}

export const encrypt = async (plainText: string) => {
    if (!window.crypto || !window.crypto.subtle) {
        console.error("API Crypto não suportada ou contexto inseguro");
        throw new Error("API Crypto não suportada ou contexto inseguro");
    }

    const encoder = new TextEncoder();
    const bufferTextoPlano = encoder.encode(plainText);
    console.log("Importando chave pública para criptografia");
    const key = await importPubKey();
    console.log("Criptografando dados");
    const encrypted: ArrayBuffer = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, bufferTextoPlano);

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};
