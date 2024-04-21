import type { PageDataApplications } from '#/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch(`/api/applications`);
	const json = await res.json() as PageDataApplications;

	return { applications: json.data };
};
