helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana bitnami/grafana --namespace grafana --create-namespace

