import { type RequestEvent } from '@sveltejs/kit';
import type { V1Pod, V1Deployment, V1StatefulSet, V1Node, V1DaemonSet } from "@kubernetes/client-node";


export type RequestHandler = (event: RequestEvent) => Response | Promise<Response>;

export interface ApplicationBase<T extends object> {
  pods: V1Pod[];
  nodes: V1Node[];
  definition: Partial<T>;
}

export type Application = ApplicationBase<V1Deployment> | ApplicationBase<V1StatefulSet> | ApplicationBase<V1DaemonSet>;

export interface PageDataApplications {
  data: Application[];
}
