

 
docker rm -f brqb
root_path=${PWD}
echo $root_path
docker run -d   -v $root_path:/opt/app -w /opt/app -p 80:8080     --name brqb google/nodejs


docker cp /etc/localtime brqb:/etc/localtime