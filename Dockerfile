# Dockerfile
FROM nginx:alpine

# 复制 Nginx 配置文件到容器中
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80