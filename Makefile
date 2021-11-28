ROOT := $(shell pwd)
VERSION := $(shell node -p "require('./package.json').version")

.PHONY: test
test:
	@echo "\nRunning integration tests..."
	@mocha test/api/init --exit
	@mocha test/api/users test/api/auth test/api/account test/api/accessKeys test/api/apps test/api/index --exit --recursive --timeout 15000

.PHONY: release-docker
release-docker:
	@echo "\nBuilding docker image..."
	docker pull node:lts-alpine
	docker build -t shmopen/code-push-server:latest --no-cache .
	docker tag shmopen/code-push-server:latest shmopen/code-push-server:${VERSION}
	docker push shmopen/code-push-server:${VERSION}
	docker push shmopen/code-push-server:latest
