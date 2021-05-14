start:
	docker-compose up

start-build:
	docker-compose up --build

start-clean:
	docker-compose up --build --force-recreate

stop:
	docker-compose down
