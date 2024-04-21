import type { Handle } from '@sveltejs/kit';
import { KubeConfig } from '@kubernetes/client-node';
import { internalConfig } from '#/resources';

interface RequestExtra {
	config?: KubeConfig;
}

declare global {
	interface Request {
		extra: RequestExtra;
	}
}

export const makeConfigFromToken = (token: string) => {
	const config = new KubeConfig();
	const cluster = internalConfig.getCurrentCluster()!;

	config.loadFromOptions({
		clusters: [cluster],
		users: [
			{
				name: 'user',
				token
			}
		],
		contexts: [
			{
				name: 'context',
				user: 'user',
				cluster: cluster.name
			}
		],
		currentContext: 'context'
	});

	return config;
};

const makeJSONResponse = (res: object): Response =>
	new Response(JSON.stringify(res), {
		headers: {
			'Content-Type': 'application/json'
		}
	});

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;
	if (pathname.match(/^\/image\/.*/)) {
		return await resolve(event);
	}

	event.request.extra = {};

	const authMethod: string = 'kube-config' // 'token'
	if (authMethod === 'token') {
		const authHeader = event.request.headers.get('authorization');

		if (!authHeader) {
			return makeJSONResponse({ error: "missing 'Authorization' header" });
		}

		const authTokenMatch = /Bearer (.*)/.exec(authHeader);
		if (!authTokenMatch) {
			return makeJSONResponse({ error: "invalid format for 'Authorization header'" });
		}

		const authToken = authTokenMatch[1];
		event.request.extra.config = makeConfigFromToken(authToken);
	}

	if (authMethod === 'kube-config') {
	 event.request.extra.config = internalConfig;
	}

	const response = await resolve(event);
	return response;
};
