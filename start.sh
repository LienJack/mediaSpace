#!/bin/sh

# 启动后端服务
cd /app/server && node dist/main.js &

# 启动前端服务
cd /app/web/web-client && npm run start 