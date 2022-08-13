docker run \
--detach \
--name=medivet-db \
--env="MYSQL_ROOT_PASSWORD=root" \
--publish 6603:3306 \
mysql:8