docker swarm init

docker stack rm kalidas_blockchain

docker build -t kalidas_wallet -f docker/Dockerfile .

docker stack deploy -c docker/docker-compose.yml kalidas_blockchain