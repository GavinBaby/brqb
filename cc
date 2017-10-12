

 
docker rm -f common
root_path=${PWD}
echo $root_path
docker run -d   -v $root_path:/opt/app -w /opt/app -p 3001:3001     --name common google/nodejs


docker cp /etc/localtime common:/etc/localtime