import { config } from 'dotenv';
import { Request } from 'express';
import { Agent } from 'https';
import { readFileSync } from 'fs';

config();

export const HTTP_PORT = process.env.PORT ?? 3000;

export const APISERVER = process.env.KUBE_APISERVER ?? "https://kubernetes.default.svc"

type AuthenitcationMode = "kubeapi" | "serviceaccount"
export const AUTHENTICATION_MODE: `${AuthenitcationMode}` = process.env.AUTHENTICATION_MODE as AuthenitcationMode ?? "kubeapi"

// Only matters if AUTHENTICATION_MODE is serviceaccount
export const SERVICEACCOUNT = process.env.KUBE_SERVICEACCOUNT_PATH ?? "/var/run/secrets/kubernetes.io/serviceaccount"
export const NAMESPACE_FILEPATH = `${SERVICEACCOUNT}/namespace`
export const TOKEN_FILEPATH = `${SERVICEACCOUNT}/token`

export const serviceAccountToken = (() => {
    if(AUTHENTICATION_MODE === "kubeapi"){
        // no token
        return null
    }

    const token = readFileSync(TOKEN_FILEPATH, 'utf8');
    return token.toString().trim()
})()

export const CA_CERT_FILEPATH = process.env.CA_CERT_PATH ?? `${SERVICEACCOUNT}/ca.crt`

export const agent = (() => {
    if(CA_CERT_FILEPATH === ""){
        console.log("Using unauthenticated agent")
        return new Agent({ rejectUnauthorized: false })
    }

    const pfx = readFileSync(CA_CERT_FILEPATH);
    return new Agent({ pfx })
})()

export const getAuthorization = (req: Request) => {
    if (AUTHENTICATION_MODE === "kubeapi"){
        return req.headers["authorization"] as string
    }

    if (AUTHENTICATION_MODE == "serviceaccount"){
        return `Bearer ${serviceAccountToken}`;
    }

    throw "Invalid authentication mode, cannot get auth for kube-api access"
}
