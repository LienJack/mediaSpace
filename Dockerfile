# Dockerfile
FROM nginx:alpine

# 添加构建参数
ARG NGINX_CONF=nginx.conf

# 复制对应的 Nginx 配置文件到容器中
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]