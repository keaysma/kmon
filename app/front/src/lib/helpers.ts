import type { Application } from '#/types';
import { podIsReady } from '#/utils';
import type { V1Deployment, V1Node, V1Pod, V1StatefulSet } from '@kubernetes/client-node';
import TimeAgo from 'javascript-time-ago'

// English.
import en from 'javascript-time-ago/locale/en'

TimeAgo.addLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

export const timeSince = (date?: Date): string => {
  if(!date) return "-";

  return timeAgo.format(new Date(date), "mini");
}

type StatusVariant = 'default' | 'secondary' | 'warning' | 'destructive';

export const getVariantForNode = (node: V1Node): StatusVariant => {
	const conditions = node.status?.conditions;

	const isReady = conditions?.find((condition) => condition.type === 'Ready')?.status === 'True';
	if (!isReady) return 'destructive';

	const isSchedulable = !(node.spec?.unschedulable === true);
	if (!isSchedulable) return 'warning';

	return 'secondary';
};

export const getVariantForPod = (pod: V1Pod): StatusVariant => {
	const isReady = podIsReady(pod);
	if (!isReady) return 'warning';

	const allPodsReady = pod.status?.containerStatuses?.every((status) => status.ready === true);
	if (!allPodsReady) return 'destructive';

	return 'secondary';
};

export const getApplicationReplicasReady = (application: Application): number => {
  return application.pods.filter(podIsReady).length;
}

export const getApplicationReplicasDesired = (application: Application): number => {
  if (application.definition.kind === "DaemonSet") {
    return application.nodes.length;
  }

  return (application.definition as V1Deployment | V1StatefulSet).status?.replicas || 0;
};

export const getVariantForApplicationReplicasStatus = (application: Application): StatusVariant => {
	const replicas = getApplicationReplicasDesired(application);
	const readyReplicas = getApplicationReplicasReady(application);

	if (replicas === readyReplicas) return 'default';
	if (readyReplicas === 0) return 'destructive';
	return 'warning';
};
