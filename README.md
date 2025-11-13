# RIGWISE

Run the app locally
------------------

The project uses Next.js and an optional FastAPI microservice for model parsing.

Start the frontend dev server:

	make dev

Start the optional backend parser (FastAPI):

	make backend

Start both (requires `concurrently` as a dev dep):

	make dev-all

Tests
-----

Run unit tests (Vitest):

	npm run test
