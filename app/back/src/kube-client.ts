import { AppsV1Api, CoreV1Api, KubeConfig } from "@kubernetes/client-node";
import { checkMatchLabels } from "./helpers";

const internalConfig = new KubeConfig();
internalConfig.loadFromDefault();

export const makeConfigFromToken = (token: string) => {
  const config = new KubeConfig();
  const cluster = internalConfig.getCurrentCluster()!;

  config.loadFromOptions({
    clusters: [cluster],
    users: [
      {
        name: "user",
        token,
      },
    ],
    contexts: [
      {
        name: "context",
        user: "user",
        cluster: cluster.name,
      },
    ],
    currentContext: "context",
  });

  return config;
};

export const getApi = async (config: KubeConfig) => {
  const k8sApi = config.makeApiClient(CoreV1Api);
  return k8sApi.getAPIResources();
};

export const getPods = async (config: KubeConfig) => {
  const k8sApi = config.makeApiClient(CoreV1Api);
  const podsResponse = await k8sApi.listPodForAllNamespaces();

  const pods = podsResponse.body.items;

  return pods;
};

export const getDeployments = async (config: KubeConfig) => {
  const k8sApi = config.makeApiClient(CoreV1Api);
  const appsApi = config.makeApiClient(AppsV1Api);

  const deploymentsResponse = await appsApi.listDeploymentForAllNamespaces();
  const podsResponse = await k8sApi.listPodForAllNamespaces();
  const servicesResponse = await k8sApi.listServiceForAllNamespaces();

  const deployments = deploymentsResponse.body.items.map((deployment) => {
    const pods = podsResponse.body.items.filter(
      (pod) =>
        pod.metadata?.namespace === deployment.metadata?.namespace &&
        checkMatchLabels(
          deployment.spec?.selector?.matchLabels,
          pod.metadata?.labels,
        ),
    );

    const services = servicesResponse.body.items.filter(
      (service) =>
        service.metadata?.namespace === deployment.metadata?.namespace &&
        pods.some((pod) =>
          checkMatchLabels(service.spec?.selector, pod.metadata?.labels),
        ),
    );

    return {
      ...deployment,
      pods,
      services,
    };
  });

  return deployments;
};
