SHELL := /bin/bash

.PHONY: dev backend dev-all test

dev:
	node ./scripts/start-dev.js

backend:
	chmod +x scripts/start-backend.sh && ./scripts/start-backend.sh

dev-all:
	concurrently "npm run backend" "npm run dev"

test:
	npm run test
