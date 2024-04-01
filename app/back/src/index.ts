import express from "express";
import {
  makeConfigFromToken,
  getApi,
  getPods,
  getDeployments,
} from "./kube-client";
import { HTTP_PORT } from "./env";
import { KubeConfig } from "@kubernetes/client-node";

const app = express();
const router = express.Router();

declare global {
  namespace Express {
    interface Request {
      config: KubeConfig;
    }
  }
}

app.use(express.json());
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  try {
    if (!authHeader) {
      throw "missing 'Authorization' header";
    }

    if (Array.isArray(authHeader)) {
      throw "multiple 'Authorization' headers specified";
    }

    const authTokenMatch = /Bearer (.*)/.exec(authHeader);
    if (!authTokenMatch) {
      throw "invalid format for 'Authorization header'";
    }

    const authToken = authTokenMatch[1];
    req.config = makeConfigFromToken(authToken);
    next();
  } catch (error) {
    return res.status(401).json({ error });
  }
});

router.get("/", async ({ config }, res) => {
  const r = await getApi(config);
  res.status(200).json(r.body);
});

router.get("/pods/list", async ({ config }, res) => {
  const pods = await getPods(config);
  res.status(200).json({
    data: pods.map(({ metadata, spec, status }) => ({
      name: metadata?.name,
      namespace: metadata?.namespace,
      phase: status?.phase,
      lables: metadata?.labels,
      volumes: spec?.volumes,
      containers: status?.containerStatuses?.map(
        ({ image, ready, state, restartCount }) => ({
          image,
          ready,
          state,
          restartCount,
        }),
      ),
      initContainers: status?.initContainerStatuses?.map(
        ({ image, ready, state, restartCount }) => ({
          image,
          ready,
          state,
          restartCount,
        }),
      ),
    })),
  });
});

router.get('/deployments/list', async ({ config }, res) => {
  const deployments = await getDeployments(config);
  res.status(200).json({
    data: deployments.map(
      ({ metadata, status, pods, services }) => ({
        name: metadata?.name,
        namespace: metadata?.namespace,
        status,
        pods: pods.map(
          (pod) => ({
            name: pod.metadata?.name,
            phase: pod.status?.phase,
          })
        ),
        services: services.map(
          (service) => ({
            name: service.metadata?.name,
            type: service.spec?.type,
            ports: service.spec?.ports
          })
        ),
        volumeMounts: pods.map(
          (pod) => pod.spec?.volumes?.map(
            ({ name, ... prop }) => {
              return {
                name,
                type: Object.entries(prop).filter(([ , props ]) => props)?.[0]?.[0]
              }
            }
          )
        ).flat()
      })
    )
  })
})

/*

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
            "pods": pods.filter((pod: any) => checkMatchLabels(item.spec.selector.matchLabels, pod.labels)),
        }))
        res.status(200).json(deployments);
    } catch (e) {
        const err = e as Error
        res.status(500).json({ "error": err.message, "cause": err.name })
    }
})
*/

app.use("/api", router);
app.listen(HTTP_PORT, () => {
  console.log(`Listening on ${HTTP_PORT}`);
});
