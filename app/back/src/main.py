import os
import requests

APISERVER="https://kubernetes.default.svc"
SERVICEACCOUNT="/var/run/secrets/kubernetes.io/serviceaccount"

# a is a subset of b
def subset(a, b):
    for k, v in a.items():
        if k not in b:
            return False
        if b[k] != v:
            return False
    return True

# Read this Pod's namespace
with open(os.path.join(SERVICEACCOUNT, "namespace")) as f:
    namespace = f.read()

# Read the ServiceAccount bearer token
with open(os.path.join(SERVICEACCOUNT, "token")) as f:
    token = f.read()

# Reference the internal certificate authority (CA)
CA_CERT = os.path.join(SERVICEACCOUNT, "ca.crt")

# Explore the API with TOKEN
# curl --cacert ${CACERT} --header "Authorization: Bearer ${TOKEN}" -X GET ${APISERVER}/api
print(requests.get(f"{APISERVER}/api", verify=CA_CERT, headers={"Authorization": f"Bearer {token}"}))

apis = requests.get(f"{APISERVER}/apis", verify=CA_CERT, headers={"Authorization": f"Bearer {token}"}).json()


pods_data = requests.get(f"{APISERVER}/api/v1/pods", verify=CA_CERT, headers={"Authorization": f"Bearer {token}"}).json()
pods = pods_data["items"]

deployments_data = requests.get(f"{APISERVER}/apis/apps/v1/deployments", verify=CA_CERT, headers={"Authorization": f"Bearer {token}"}).json()
deployments = deployments_data["items"]

# Main functionality demo: Relate deployments to pods
for deploy in deployments:
    deploy_pods = []

    metadata = deploy["metadata"]
    spec = deploy["spec"]

    deploy_namespace = metadata["namespace"]
    selector = spec["selector"]

    # Assume matchLabels for now, no support for other selectors
    matchLabels = selector.get("matchLabels")
    if matchLabels:
        match_pods = list(filter(lambda pod: (pod["metadata"]["namespace"] == deploy_namespace and subset(matchLabels, pod["metadata"].get("labels", {}))), pods))
        deploy_pods.extend(match_pods)
        # deploy_pods.extend(list(filter(lambda pod: pod["metadata"]["namespace"] == namespace and subset(matchLabels, pod["metadata"]["labels"]), pods)))
    
    print(f"Deployment: {metadata['name']}")
    print(f"Pods: {', '.join([pod['metadata']['name'] for pod in deploy_pods])}")
    print()

