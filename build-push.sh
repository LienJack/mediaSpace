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

# 检查 Docker 登录状态
check_docker_login() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker 未运行或无法访问"
        exit 1
    fi
    
    # if ! docker system info | grep -q "Username"; then
    #     print_error "请先登录 Docker Hub: docker login"
    #     exit 1
    # fi
}

# 构建并推送镜像
build_and_push() {
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
    
    # 推送镜像
    print_info "推送镜像到 Docker Hub..."
    docker push lienjoe/mediaspace-backend:${version}
    docker push lienjoe/mediaspace-frontend:${version}
    
    # 如果是最新版本，也打上 latest 标签
    if [ "$version" != "latest" ]; then
        docker tag lienjoe/mediaspace-backend:${version} lienjoe/mediaspace-backend:latest
        docker tag lienjoe/mediaspace-frontend:${version} lienjoe/mediaspace-frontend:latest
        docker push lienjoe/mediaspace-backend:latest
        docker push lienjoe/mediaspace-frontend:latest
    fi
}

# 主函数
main() {
    # 检查 Docker 登录状态
    check_docker_login
    
    # 获取版本号（可选）
    version=${1:-latest}
    
    # 构建并推送镜像
    build_and_push $version
    
    print_info "镜像构建和推送完成！"
}

# 运行主函数
main "$@" 