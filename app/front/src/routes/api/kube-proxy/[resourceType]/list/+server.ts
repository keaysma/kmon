import { error } from '@sveltejs/kit';
import { genericResourceApi } from '#/resources';
import type { RequestHandler } from '#/types';

export const GET: RequestHandler = async ({ request, params }) => {
	if (!params.resourceType) {
		error(400, 'No resource type');
	}

	return new Response(JSON.stringify({
	  data: await genericResourceApi.listForAllNamespaces(request.extra.config!, params.resourceType)
	}));
};
