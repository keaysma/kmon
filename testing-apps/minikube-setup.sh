minikube start --nodes 2

# https://github.com/kubernetes/minikube/issues/12360#issuecomment-1430243861
minikube addons disable storage-provisioner
minikube addons disable default-storageclass
minikube addons enable volumesnapshots
minikube addons enable csi-hostpath-driver
kubectl patch storageclass csi-hostpath-sc -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

# https://minikube.sigs.k8s.io/docs/handbook/registry/
minikube addons enable registry
docker run -d --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip):5000"
# docker tag myimage:latest localhost:5000/myimage
# docker push localhost:5000/myimage
# k run test --image localhost:5000/kmon:latest -- sleep infinity
