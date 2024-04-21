import type { KubeConfig } from '@kubernetes/client-node';
import { IncomingMessage } from 'http';

export interface ResourceApiInterface<Resource extends object> {
  listForAllNamespaces: (config: KubeConfig, resourceType: string) => Promise<{
      response: IncomingMessage;
      body: Resource;
  }>;
}
