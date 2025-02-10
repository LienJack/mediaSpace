# mediaSpace
用来制作视频流程规范的项目


# 主题配色

[主题配色](https://mui.com/material-ui/customization/dark-mode/)

# 项目命令

## 环境启动
我们提供了一个统一的脚本 `run.sh` 来管理开发和生产环境：

### 基本用法
```bash
./run.sh [选项]
```

### 可用选项
- `--dev`：使用开发环境配置
- `--prod`：使用生产环境配置（默认）
- `--build`：重新构建容器
- `--update`：从git仓库拉取最新代码
- `--help`：显示帮助信息

### 常用命令示例
1. 开发环境：
   ```bash
   # 首次运行或需要重新构建
   ./run.sh --dev --build
   
   # 日常开发启动（不需要重新构建）
   ./run.sh --dev

   # 更新代码并启动开发环境
   ./run.sh --dev --update
   ```

2. 生产环境：
   ```bash
   # 首次运行或需要重新构建
   ./run.sh --prod --build
   # 或
   ./run.sh --build
   
   # 日常启动（不需要重新构建）
   ./run.sh

   # 更新代码并启动生产环境
   ./run.sh --update
   ```

3. 代码更新：
   ```bash
   # 仅更新代码
   ./run.sh --update

   # 更新代码并重新构建
   ./run.sh --update --build

   # 更新代码并在开发环境重新构建
   ./run.sh --update --dev --build
   ```

## Docker Compose 单独命令
如果需要对单个服务进行操作，可以使用以下命令：

### 基础操作
```bash
# 启动所有服务
docker-compose up -d   

# 停止所有服务
docker-compose down
```

### 后端服务操作
```bash
# 重启后端
docker-compose restart backend

# 重新构建并启动后端
docker-compose up -d --force-recreate --build backend
```

### 前端服务操作
```bash
# 重启前端
docker-compose restart frontend

# 重新构建并启动前端
docker-compose up -d --force-recreate --build frontend
```

### 环境说明
- 开发环境：
  - 使用 `nginx.dev.conf` 配置
  - 后端使用 `npm run start:dev`（支持热重载）
  - 前端使用 `npm run dev`（支持热重载）
  - 适合本地开发调试

- 生产环境：
  - 使用 `nginx.conf` 配置
  - 后端使用 `npm run start:prod`
  - 前端使用 `npm run start`
  - 适合生产部署
