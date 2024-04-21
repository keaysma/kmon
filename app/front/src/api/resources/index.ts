import axios from 'axios';
import fs from 'fs';
import { Agent } from 'https';
import { IncomingMessage } from 'http';
import type { ResourceApiInterface } from "./types";
import { CoreV1Api, KubeConfig } from '@kubernetes/client-node';

export const internalConfig = new KubeConfig();
internalConfig.loadFromDefault();

const agentRef = {
  agent: undefined
}

fs.readFile(internalConfig.getCurrentCluster()!.caFile!, (err, ca) => {
  agentRef.agent = new Agent({
    ca: ca.toString()
  })
})

export const genericResourceApi: ResourceApiInterface<object> = {
  async listForAllNamespaces(config, resourceType) {
    const currentCluster = config.getCurrentCluster()!;
    console.log(currentCluster.caFile)

    const response = await axios.get<{
      response: IncomingMessage;
      body: object;
    }>(
      `${currentCluster.server}/api/v1/${resourceType}`, {
        httpsAgent: agentRef.agent,
        headers: {
          Authorization: `Bearer ${config.getCurrentUser()?.token}`
        }
      }
    );

    return response.data;
  },
}
