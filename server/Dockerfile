# 使用Node.js官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 安装必要的工具
RUN apk add  curl git

RUN npm config set registry https://registry.npmmirror.com/ 
# 安装pnpm
RUN npm install -g pnpm@8.15.4

# 配置镜像源
RUN pnpm config set registry https://registry.npmmirror.com/


# 复制package.json和pnpm-lock.yaml
COPY package*.json pnpm-lock.yaml ./

# 全局安装prisma CLI
# RUN pnpm add -g prisma

# 安装依赖
RUN pnpm install

# 复制prisma配置
COPY prisma ./prisma/

# 生成Prisma客户端
RUN pnpm prisma generate

# 复制其余源代码
COPY . .

# 构建应用
RUN pnpm build

# 验证dist目录是否存在
RUN ls -la dist && \
    test -f dist/main.js

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start:prod"] 