#!/bin/bash

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 构建并导出镜像
build_and_export() {
    local version=$1
    
    # 清理 Docker 构建缓存
    print_info "清理 Docker 构建缓存..."
    docker builder prune -f
    
    # 构建后端镜像
    print_info "构建后端镜像..."
    docker build --no-cache -t lienjoe/mediaspace-backend:${version} -f server/Dockerfile ./server
    
    # 构建前端镜像
    print_info "构建前端镜像..."
    docker build --no-cache -t lienjoe/mediaspace-frontend:${version} -f web/web-client/Dockerfile ./web/web-client
    
    # 导出所有镜像到单个文件
    print_info "导出镜像到 .dockerbuild 文件..."
    docker save \
        lienjoe/mediaspace-backend:${version} \
        lienjoe/mediaspace-frontend:${version} \
        > mediaspace-${version}.dockerbuild
    
    print_info "创建说明文件..."
    cat > README.md << EOF
# MediaSpace Docker 镜像导入说明

## 群辉 Docker 导入步骤：

1. 将 \`mediaspace-${version}.dockerbuild\` 上传到群辉
2. 在群辉 Docker 界面中，选择"映像"
3. 点击"添加" -> "从文件添加"
4. 选择 .dockerbuild 文件导入
5. 导入完成后，可以在映像列表中看到：
   - lienjoe/mediaspace-backend:${version}
   - lienjoe/mediaspace-frontend:${version}

## 创建 docker-compose.yml

请创建以下 docker-compose.yml 文件：

\`\`\`yaml
version: '3.8'

services:
  backend:
    image: lienjoe/mediaspace-backend:${version}
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data

  frontend:
    image: lienjoe/mediaspace-frontend:${version}
    restart: always
    ports:
      - "80:3000"
    depends_on:
      - backend
\`\`\`

## 启动服务

在 docker-compose.yml 所在目录执行：

\`\`\`bash
docker-compose up -d
\`\`\`
EOF
    
    print_info "完成！生成的文件："
    print_info "1. mediaspace-${version}.dockerbuild (镜像文件)"
    print_info "2. README.md (导入说明)"
}

# 主函数
main() {
    # 获取版本号（可选）
    version=${1:-latest}
    
    # 构建并导出镜像
    build_and_export $version
}

# 运行主函数
main "$@" 