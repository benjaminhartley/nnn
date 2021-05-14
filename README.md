# nnn

## Requirements

* docker, docker-compose
* redis, postgres images

### Setup Instructions

Initialize Docker data directories

```bash
make setup
```

### Initialize wallet seed and id

```bash
docker-compose up
docker exec -it nnn_wallet_1 /bin/bash
```

- Create wallet per [documentation](https://github.com/appditto/pippin_nano_wallet#cli-documentation)
- Securely back up seed
- Set WALLET_ID in wallet-manager/.env file

## To Do

* create common modules
* create common environments
* SSL
* container health checks
* use non-root users in containers
* ensure credentials are not retained in containers
