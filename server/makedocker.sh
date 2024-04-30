#!/bin/zsh
docker build . -t zzglider/ewvm:latest
docker stop ewvm
docker rm ewvm
docker run -d -p 50520:50520 --name ewvm zzglider/ewvm:latest