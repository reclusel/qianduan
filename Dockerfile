FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/nginx:1.26.1-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY dist/ /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]