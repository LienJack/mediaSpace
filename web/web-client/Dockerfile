# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录和环境变量
WORKDIR /app
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    NODE_OPTIONS="--max-old-space-size=4096" \
    NEXT_TELEMETRY_DISABLED=1 \
    CI=true \
    PORT=8000 \
    NEXT_PUBLIC_API_URL=/api

# 接收构建参数
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# 安装系统依赖和配置
RUN apk add  curl git && \
    npm config set registry https://registry.npmmirror.com/ && \
    npm install -g pnpm@8.15.4 && \
    pnpm config set registry https://registry.npmmirror.com/ \
    pnpm add -g next

# 设置 npm 镜像
RUN npm config set registry https://registry.npmmirror.com/ 
# RUN npm config set registry https://mirrors.aliyun.com/

# 安装 pnpm
RUN npm install -g pnpm@8.15.4
    
# 配置 pnpm 镜像源
RUN pnpm config set registry https://registry.npmmirror.com/
# RUN pnpm config set registry https://mirrors.aliyun.com/

# 复制所有源代码
COPY . .

# 安装依赖（包括开发依赖）
RUN pnpm install --prod=false

# 复制项目文件
COPY . .

# 构建应用
RUN pnpm build

# 清理缓存
RUN pnpm cache clean && \
    rm -rf /var/cache/apk/*

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["pnpm", "start", "-p", "8000"] 