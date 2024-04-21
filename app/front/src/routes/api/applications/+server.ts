import type { Application, RequestHandler } from '#/types';
import { checkMatchLabels } from '#/utils';
import { AppsV1Api, BatchV1Api, CoreV1Api, V1Deployment, V1Node } from '@kubernetes/client-node';

export const GET: RequestHandler = async ({ request, params }) => {
	const k8sApi = request.extra.config!.makeApiClient(CoreV1Api);
	const appsApi = request.extra.config!.makeApiClient(AppsV1Api);
	// const batchApi = request.extra.config!.makeApiClient(BatchV1Api);

	const [
		nodes,
		podsBase,
		deploymentsBase,
		statefulsetBase,
		daemonsetBase,
		// services, replicaSets
	] = await Promise.all([
		k8sApi.listNode(),
		k8sApi.listPodForAllNamespaces(),
		appsApi.listDeploymentForAllNamespaces(),
		appsApi.listStatefulSetForAllNamespaces(),
		appsApi.listDaemonSetForAllNamespaces(),
		// k8sApi.listServiceForAllNamespaces(),
		// appsApi.listReplicaSetForAllNamespaces()
	]);

	const nodeMap = nodes.body.items.reduce(
		(acc, node) => {
			acc[node.metadata!.name!] = node;
			return acc;
		},
		{} as Record<string, V1Node>
	);

	const deployments = deploymentsBase.body.items.map((definition) => {
		const pods = podsBase.body.items.filter((pod) =>
			checkMatchLabels(definition.spec?.selector.matchLabels, pod.metadata?.labels)
		);

		const nodeNames = [...new Set(pods.map(({ spec }) => spec?.nodeName))].filter(
			Boolean
		) as string[];
		const nodes = nodeNames.map<V1Node>((name: string) => nodeMap[name]).filter(Boolean);

		return {
			definition: {
				...definition,
				kind: 'Deployment'
			},
			pods,
			nodes
		};
	});

	const statefulsets = statefulsetBase.body.items.map((definition) => {
		const pods = podsBase.body.items.filter((pod) =>
			checkMatchLabels(definition.spec?.selector.matchLabels, pod.metadata?.labels)
		);

		const nodeNames = [...new Set(pods.map(({ spec }) => spec?.nodeName))].filter(
			Boolean
		) as string[];
		const nodes = nodeNames.map<V1Node>((name: string) => nodeMap[name]).filter(Boolean);

		return {
			definition: {
				...definition,
				kind: 'StatefulSet'
			},
			pods,
			nodes
		};
	});

	const daemonsets = daemonsetBase.body.items.map((definition) => {
		const pods = podsBase.body.items.filter((pod) =>
			checkMatchLabels(definition.spec?.selector.matchLabels, pod.metadata?.labels)
		);

		const nodeNames = [...new Set(pods.map(({ spec }) => spec?.nodeName))].filter(
			Boolean
		) as string[];
		const nodes = nodeNames.map<V1Node>((name: string) => nodeMap[name]).filter(Boolean);

		return {
			definition: {
				...definition,
				kind: 'DaemonSet'
			},
			pods,
			nodes
		};
	});

	const data = [...deployments, ... statefulsets, ... daemonsets] satisfies Application[];

	return new Response(
		JSON.stringify({
			data
		})
	);
};
