import express from 'express';
import { getApi, getPods, getDeployments } from './kube-api';
import { checkMatchLabels, isSubset } from './helpers'
import { HTTP_PORT } from './env';

const app = express();
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const r = await getApi(req);

        res.status(200).json(r.data);
    } catch (e) {
        const err = e as Error
        res.status(500).json({ "error": err.message, "cause": err.name })
    }
});

router.get('/pods', async (req, res) => {
    try {
        const r = await getPods(req)
        const data = r.data

        const pods = data.items.map((item: any) => ({
            "name": item.metadata.name,
            "namespace": item.metadata.namespace,
            "labels": item.metadata.labels,
            "containers": item.spec.containers.length,
            "initContainers": item.spec.initContainers?.length ?? 0
        }))
        res.status(200).json(pods);
    } catch (e) {
        const err = e as Error
        res.status(500).json({ "error": err.message, "cause": err.name })
    }
})

router.get('/deployments', async (req, res) => {
    try {
        const r = await getDeployments(req)
        const data = r.data

	const podsReq = await getPods(req)
	const pods = podsReq.data.items.map(
	    (pod: any) => ({
	        "name": pod.metadata.name,
		"namespace": pod.metadata.namespace,
		"labels": pod.metadata.labels,
	    })
	)

        const deployments = data.items.map((item: any) => ({
            "name": item.metadata.name,
            "namespace": item.metadata.namespace,
            "labels": item.metadata.labels,
	    "replicas": item.spec.replicas,
	    "selector": item.spec.selector,
            // "pods": pods.filter((pod: any) => checkMatchLabels(item.spec.selector.matchLabels, pod.labels)),
            "pods": pods.filter((pod: any) => isSubset(item.spec.selector.matchLabels, pod.labels)),
        }))
        res.status(200).json(deployments);
    } catch (e) {
        const err = e as Error
        res.status(500).json({ "error": err.message, "cause": err.name })
    }
})

app.use('/api', router)
app.listen(HTTP_PORT, () => {
    console.log(`Listening on ${HTTP_PORT}`)
})
