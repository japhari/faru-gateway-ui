#!/bin/sh

docker compose -f docker-compose-uat.yml build --no-cache
docker compose -f docker-compose-uat.yml up -d
