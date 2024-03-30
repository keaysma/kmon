#! /bin/bash

docker build . -t kmon:latest
docker tag kmon:latest localhost:5000/kmon
docker push localhost:5000/kmon

