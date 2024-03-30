import { Request } from "express"
import { APISERVER, getAuthorization, agent } from "./env"
import axios from "axios"

export const getApi = (req: Request) => {
    return axios.get(`${APISERVER}/api`, {
        httpsAgent: agent,
        headers: {
            "Authorization": getAuthorization(req)
        },
        responseType: "json"
    })
}

export const getPods = (req: Request) => {
    return axios.get(`${APISERVER}/api/v1/pods`, {
        httpsAgent: agent,
        headers: {
            "Authorization": getAuthorization(req)
        },
        responseType: "json"
    })
}

export const getDeployments = (req: Request) => {
    return axios.get(`${APISERVER}/apis/apps/v1/deployments`, {
        httpsAgent: agent,
	headers: {
	    "Authorization": getAuthorization(req)
	},
	responseType: "json"
    })
}

