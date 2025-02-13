#!/bin/bash

# 设置严格模式
set -eo pipefail

# 定义脚本版本
VERSION="1.0.0"

# 定义输出目录
OUTPUT_DIR="./docker-builds"

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 服务配置
SERVICES=(backend frontend mysql alist redis nginx)
IMAGES=(
    "lienjoe/mediaspace-backend"
    "lienjoe/mediaspace-frontend"
    "mysql:8.0"
    "xhofe/alist:latest"
    "redis:7.2-alpine"
    "nginx:1.25-alpine"
)
DOCKERFILES=(
    "server/Dockerfile"
    "web/web-client/Dockerfile"
    "-"
    "-"
    "-"
    "-"
)
CONTEXTS=(
    "./server"
    "./web/web-client"
    "-"
    "-"
    "-"
    "-"
)

# 定义哪些服务需要本地构建
LOCAL_BUILD_SERVICES=(backend frontend)

# 镜像源配置
REGISTRY_MIRRORS=(
    "https://mirror.ccs.tencentyun.com"
    "https://registry.docker-cn.com"
    "https://docker.mirrors.ustc.edu.cn"
    "https://registry.cn-hangzhou.aliyuncs.com"
)

# 获取服务配置
get_service_config() {
    local service=$1
    local index=0
    
    for s in "${SERVICES[@]}"; do
        if [[ "$s" == "$service" ]]; then
            echo "${IMAGES[$index]} ${DOCKERFILES[$index]} ${CONTEXTS[$index]}"
            return 0
        fi
        ((index++))
    done
    return 1
}

# 验证服务配置
validate_service_configs() {
    if [[ ${#SERVICES[@]} != ${#IMAGES[@]} ]] || \
       [[ ${#SERVICES[@]} != ${#DOCKERFILES[@]} ]] || \
       [[ ${#SERVICES[@]} != ${#CONTEXTS[@]} ]]; then
        print_error "服务配置数组长度不匹配"
        exit 1
    fi
}

# 检查服务是否存在
service_exists() {
    local service=$1
    for s in "${SERVICES[@]}"; do
        if [[ "$s" == "$service" ]]; then
            return 0
        fi
    done
    return 1
}

# 在主函数开始前验证配置
validate_service_configs

# 打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" >&2
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

print_debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1" >&2
    fi
}

# 错误处理函数
handle_error() {
    print_error "在第 $1 行发生错误。退出码: $2"
    exit "$2"
}

# 设置错误处理
trap 'handle_error ${LINENO} $?' ERR

# 检查必要的命令
check_requirements() {
    local required_commands=("docker" "grep" "awk" "sed")
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_error "未找到必需的命令: $cmd"
            exit 1
        fi
    done
}

# 显示进度条
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((width * current / total))
    local remaining=$((width - completed))
    
    printf "\r[%${completed}s%${remaining}s] %d%%" \
        | sed "s/ /=/g" \
        | sed "s/\s/-/g"
    
    if [ "$current" -eq "$total" ]; then
        echo
    fi
}

# 清理旧的构建文件
cleanup() {
    local keep_versions=${1:-3}
    print_info "清理旧的构建文件，保留最新的 $keep_versions 个版本..."
    
    for service in "${SERVICES[@]}"; do
        find "$OUTPUT_DIR" -name "mediaspace-$service-*.dockerbuild" \
            | sort -r \
            | tail -n +$((keep_versions + 1)) \
            | xargs -r rm -f
        
        find "$OUTPUT_DIR" -name "README-$service-*.md" \
            | sort -r \
            | tail -n +$((keep_versions + 1)) \
            | xargs -r rm -f
    done
}

# 检查网络连接
check_network() {
    local test_urls=("www.baidu.com" "www.aliyun.com")
    
    for url in "${test_urls[@]}"; do
        if ping -c 1 "$url" &> /dev/null; then
            return 0
        fi
    done
    
    print_error "网络连接异常，请检查网络设置"
    return 1
}

# 配置 Docker 镜像源
configure_registry_mirrors() {
    local docker_config="/etc/docker/daemon.json"
    local temp_config="/tmp/daemon.json"
    
    # 如果配置文件不存在，创建一个新的
    if [[ ! -f "$docker_config" ]]; then
        print_info "创建 Docker 配置文件..."
        echo '{"registry-mirrors":[]}' | sudo tee "$docker_config" > /dev/null
    fi
    
    # 添加镜像源
    print_info "配置 Docker 镜像源..."
    local mirrors_json="["
    for mirror in "${REGISTRY_MIRRORS[@]}"; do
        mirrors_json+="\"$mirror\","
    done
    mirrors_json="${mirrors_json%,}]"
    
    # 更新配置文件
    jq ".\"registry-mirrors\" = $mirrors_json" "$docker_config" > "$temp_config"
    if [[ $? -eq 0 ]]; then
        sudo mv "$temp_config" "$docker_config"
        sudo systemctl restart docker
        print_info "Docker 镜像源配置完成"
    else
        print_warning "无法更新 Docker 配置，继续使用当前设置"
    fi
}

# 拉取镜像（带重试）
pull_image() {
    local image=$1
    local max_retries=3
    local retry_count=0
    local wait_time=5
    
    while ((retry_count < max_retries)); do
        print_info "尝试拉取镜像 (${retry_count}/${max_retries})..."
        if docker pull "$image"; then
            return 0
        fi
        
        ((retry_count++))
        if ((retry_count < max_retries)); then
            print_warning "拉取失败，${wait_time}秒后重试..."
            sleep $wait_time
            wait_time=$((wait_time * 2))
        fi
    done
    
    return 1
}

# 检查服务是否需要本地构建
is_local_build() {
    local service=$1
    for s in "${LOCAL_BUILD_SERVICES[@]}"; do
        if [[ "$s" == "$service" ]]; then
            return 0
        fi
    done
    return 1
}

# 构建并导出单个服务
build_and_export_service() {
    local service=$1
    local version=$2
    
    print_info "开始处理 ${service} 服务..."
    
    # 检查服务是否存在
    if ! service_exists "$service"; then
        print_error "未知的服务类型: ${service}"
        return 1
    fi
    
    # 创建输出目录
    mkdir -p "$OUTPUT_DIR"
    
    # 获取服务配置
    local config
    config=$(get_service_config "$service")
    read -r image_name dockerfile context <<< "$config"
    
    # 根据服务类型选择构建或拉取
    if is_local_build "$service"; then
        print_info "本地构建 ${service} 服务..."
        if ! docker build --no-cache -t "${image_name}:${version}" -f "$dockerfile" "$context"; then
            print_error "${service} 镜像构建失败"
            return 1
        fi
        # 本地构建的服务使用指定的版本标签
        local final_image="${image_name}:${version}"
    else
        print_info "拉取 ${service} 服务镜像..."
        if ! pull_image "$image_name"; then
            print_error "${service} 镜像拉取失败"
            return 1
        fi
        # 直接拉取的服务使用原始镜像名（包含其自带的标签）
        local final_image="${image_name}"
    fi
    
    # 导出镜像
    print_info "导出 ${service} 镜像..."
    local output_file="${OUTPUT_DIR}/mediaspace-${service}-${version}.dockerbuild"
    if ! docker save "${final_image}" > "$output_file"; then
        print_error "${service} 镜像导出失败"
        return 1
    fi
    
    # 创建说明文件
    create_readme "$service" "$version"
    
    print_info "${service} 服务处理完成"
    return 0
}

# 创建说明文件
create_readme() {
    local service=$1
    local version=$2
    local readme_file="${OUTPUT_DIR}/README-${service}-${version}.md"
    
    print_info "创建 ${service} 服务的说明文件..."
    
    # 通用头部
    cat > "$readme_file" << EOF
# MediaSpace ${service^} Docker 镜像导入说明

## 导入步骤：
1. 将 \`mediaspace-${service}-${version}.dockerbuild\` 上传到服务器
2. 使用以下命令导入镜像：
   \`\`\`bash
   docker load < mediaspace-${service}-${version}.dockerbuild
   \`\`\`

## Docker Compose 配置示例：
EOF
    
    # 根据服务类型添加特定配置
    case $service in
        "backend")
            cat >> "$readme_file" << EOF
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
      - DATABASE_URL=mysql://user:password@mysql:3306/mediaspace
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
    depends_on:
      - mysql
      - redis
\`\`\`
EOF
            ;;
        "frontend")
            cat >> "$readme_file" << EOF
\`\`\`yaml
version: '3.8'
services:
  frontend:
    image: lienjoe/mediaspace-frontend:${version}
    restart: always
    ports:
      - "80:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend
\`\`\`
EOF
            ;;
        "mysql")
            cat >> "$readme_file" << EOF
\`\`\`yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=your_root_password
      - MYSQL_DATABASE=mediaspace
      - MYSQL_USER=mediaspace
      - MYSQL_PASSWORD=your_password
    volumes:
      - ./mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
\`\`\`

## 环境变量说明：
- MYSQL_ROOT_PASSWORD: MySQL root用户密码
- MYSQL_DATABASE: 数据库名称
- MYSQL_USER: 数据库用户名
- MYSQL_PASSWORD: 数据库密码
EOF
            ;;
        "alist")
            cat >> "$readme_file" << EOF
\`\`\`yaml
version: '3.8'
services:
  alist:
    image: xhofe/alist:latest
    restart: always
    ports:
      - "5244:5244"
    volumes:
      - ./alist-data:/opt/alist/data
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
\`\`\`

## 环境变量说明：
- PUID: 用户ID
- PGID: 用户组ID
- TZ: 时区
EOF
            ;;
        "redis")
            cat >> "$readme_file" << EOF
\`\`\`yaml
version: '3.8'
services:
  redis:
    image: redis:7.2-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - ./redis-data:/data
\`\`\`

## 环境变量说明：
- 无
EOF
            ;;
        "nginx")
            cat >> "$readme_file" << EOF
\`\`\`yaml
version: '3.8'
services:
  nginx:
    image: nginx:1.25-alpine
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx-config:/etc/nginx/nginx.conf
      - ./nginx-html:/usr/share/nginx/html
      - ./nginx-logs:/var/log/nginx
\`\`\`

## 环境变量说明：
- 无
EOF
            ;;
    esac
    
    # 添加通用注意事项
    cat >> "$readme_file" << EOF

## 注意事项：
1. 请根据实际情况修改配置中的密码和端口
2. 建议使用 Docker 网络来连接各个服务
3. 生产环境部署时请注意数据持久化和安全性配置
4. 建议定期备份数据卷中的数据

## 版本信息：
- 构建时间: $(date '+%Y-%m-%d %H:%M:%S')
- 版本号: ${version}
EOF
}

# 显示使用帮助
show_help() {
    cat << EOF
MediaSpace Docker 镜像构建工具 v${VERSION}

使用方法: 
    $0 [选项] <版本号>

选项:
    -s, --service <服务名>    指定要构建的服务 (backend|frontend|mysql|alist|redis|nginx|all)
    -c, --cleanup [数量]      清理旧的构建文件，可选择保留的版本数量
    -d, --debug              启用调试模式
    -h, --help              显示此帮助信息
    -v, --version           显示版本信息

支持的服务:
    backend   - 后端服务
    frontend  - 前端服务
    mysql     - MySQL数据库
    alist     - Alist文件管理器
    redis     - Redis数据库
    nginx     - Nginx反向代理
    all       - 所有服务

示例:
    $0 -s backend v1.0.0     # 只构建后端服务
    $0 -s all v1.0.0         # 构建所有服务
    $0 -c 5                  # 清理旧的构建文件，保留最新的5个版本
    $0 -d -s backend v1.0.0  # 以调试模式构建后端服务

输出目录:
    所有构建文件将保存在 ${OUTPUT_DIR} 目录下
EOF
}

# 主函数
main() {
    local service="all"
    local version="latest"
    local cleanup_versions=""
    
    # 检查必要的命令
    check_requirements
    
    # 检查网络连接
    # if ! check_network; then
    #     exit 1
    # fi
    
    # 配置镜像源（如果需要）
    if [[ "${CONFIGURE_MIRRORS:-false}" == "true" ]]; then
        configure_registry_mirrors
    fi
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -s|--service)
                service="$2"
                shift 2
                ;;
            -c|--cleanup)
                if [[ $# -gt 1 && ! "$2" =~ ^- ]]; then
                    cleanup_versions="$2"
                    shift 2
                else
                    cleanup_versions="3"
                    shift 1
                fi
                ;;
            -d|--debug)
                DEBUG=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                echo "v${VERSION}"
                exit 0
                ;;
            *)
                if [[ $1 =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                    version="$1"
                else
                    print_error "无效的版本号格式: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # 如果指定了清理选项
    if [[ -n "$cleanup_versions" ]]; then
        cleanup "$cleanup_versions"
        [[ "$service" == "cleanup" ]] && exit 0
    fi
    
    # 清理 Docker 构建缓存
    print_info "清理 Docker 构建缓存..."
    docker builder prune -f
    
    # 如果是构建所有服务
    if [[ "$service" == "all" ]]; then
        local total_services=${#SERVICES[@]}
        local current_service=0
        
        for srv in "${SERVICES[@]}"; do
            ((current_service++))
            print_info "处理服务 ($current_service/$total_services): $srv"
            if ! build_and_export_service "$srv" "$version"; then
                print_error "服务 $srv 构建失败"
                continue
            fi
            show_progress "$current_service" "$total_services"
        done
    else
        # 构建单个服务
        if ! build_and_export_service "$service" "$version"; then
            print_error "服务 $service 构建失败"
            exit 1
        fi
    fi
    
    print_info "所有任务完成！"
    print_info "构建文件位于: ${OUTPUT_DIR}"
}

# 运行主函数
main "$@" 