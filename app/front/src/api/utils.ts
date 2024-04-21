import type { V1LabelSelector, V1ObjectMeta, V1Pod } from "@kubernetes/client-node";

export const checkMatchLabels = (matchLabels: V1LabelSelector['matchLabels'], podLabels: V1ObjectMeta['labels']): boolean => {
    if (!matchLabels || !podLabels) return false;
    return !Object.entries(matchLabels).some(
        ([k, v]) => podLabels[k] !== v
    )
}

export const checkMatchExpressions = (matchExpressions: V1LabelSelector['matchExpressions'], podLabels: V1ObjectMeta['labels']): boolean => true

export const podIsReady = (pod: V1Pod): boolean => {
    return pod.status?.conditions?.find((condition) => condition.type === 'Ready')?.status === 'True';
}
