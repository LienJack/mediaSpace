# 设置控制台颜色输出函数
function Write-ColorOutput {
    param (
        [Parameter(Mandatory)]
        [string]$Message,
        [Parameter(Mandatory)]
        [string]$Type
    )
    
    $color = switch ($Type) {
        "INFO" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

# 显示帮助信息
function Show-Help {
    Write-Host @"
用法: .\run.ps1 [选项]
选项:
  -Dev     使用开发环境配置
  -Prod    使用生产环境配置（默认）
  -Build   重新构建容器
  -Update  更新代码（从git仓库拉取最新代码）
  -Help    显示此帮助信息

示例:
  .\run.ps1 -Dev -Build    构建并启动开发环境
  .\run.ps1 -Dev           启动开发环境（不重新构建）
  .\run.ps1 -Prod -Build   构建并启动生产环境
  .\run.ps1                启动生产环境（不重新构建）
  .\run.ps1 -Update        更新代码并启动
"@
}

# 检查并创建alist文件夹及其结构
function Check-AndCreateAlist {
    $alistDir = "..\alist"
    
    if (-not (Test-Path $alistDir)) {
        Write-ColorOutput "创建alist文件夹及其结构..." "INFO"
        New-Item -Path "$alistDir\mnt\image" -ItemType Directory -Force | Out-Null
        New-Item -Path "$alistDir\mnt\video" -ItemType Directory -Force | Out-Null
        Write-ColorOutput "alist文件夹及其结构已创建。" "INFO"
    }
    else {
        Write-ColorOutput "alist文件夹已存在，检查其结构..." "INFO"
        if (-not (Test-Path "$alistDir\mnt")) {
            Write-ColorOutput "创建缺失的mnt文件夹..." "INFO"
            New-Item -Path "$alistDir\mnt" -ItemType Directory -Force | Out-Null
        }
        if (-not (Test-Path "$alistDir\mnt\image")) {
            Write-ColorOutput "创建缺失的image文件夹..." "INFO"
            New-Item -Path "$alistDir\mnt\image" -ItemType Directory -Force | Out-Null
        }
        if (-not (Test-Path "$alistDir\mnt\video")) {
            Write-ColorOutput "创建缺失的video文件夹..." "INFO"
            New-Item -Path "$alistDir\mnt\video" -ItemType Directory -Force | Out-Null
        }
    }
}

# 更新代码函数
function Update-Code {
    Write-ColorOutput "正在从git仓库main分支拉取最新代码..." "INFO"
    
    # 检查当前分支
    $currentBranch = git rev-parse --abbrev-ref HEAD
    if ($currentBranch -ne "main") {
        Write-ColorOutput "当前不在main分支，正在切换到main分支..." "WARNING"
        if (-not (git checkout main)) {
            Write-ColorOutput "切换到main分支失败" "ERROR"
            exit 1
        }
    }
    
    # 设置上游分支并拉取
    git branch --set-upstream-to=origin/main main 2>$null
    
    if (git pull origin main) {
        Write-ColorOutput "代码更新成功" "INFO"
    }
    else {
        Write-ColorOutput "代码更新失败" "ERROR"
        exit 1
    }
}

# 检查配置文件
function Check-ConfigFiles {
    param (
        [string]$env
    )
    
    $nginxConf = "nginx.$env.conf"
    if (-not (Test-Path $nginxConf)) {
        Write-ColorOutput "找不到 ${nginxConf} 配置文件" "ERROR"
        exit 1
    }
}

# 参数定义
param(
    [switch]$Dev,
    [switch]$Prod,
    [switch]$Build,
    [switch]$Update,
    [switch]$Help
)

# 显示帮助
if ($Help) {
    Show-Help
    exit 0
}

# 设置默认环境
$env = if ($Dev) { "dev" } else { "prod" }

# 如果需要更新代码
if ($Update) {
    Update-Code
}

# 根据环境设置变量
if ($env -eq "dev") {
    Write-ColorOutput "使用开发环境配置..." "INFO"
    $composeFile = "docker-compose.dev.yml"
    $env:NGINX_CONF = "nginx.dev.conf"
    $env:NODE_ENV = "development"
    $env:BACKEND_CMD = "npm run start:dev"
    $env:FRONTEND_CMD = "npm run dev"
    
    Write-ColorOutput "检查开发环境配置..." "INFO"
    Check-ConfigFiles "dev"
}
else {
    Write-ColorOutput "使用生产环境配置..." "INFO"
    $composeFile = "docker-compose.prod.yml"
    $env:NGINX_CONF = "nginx.prod.conf"
    $env:NODE_ENV = "production"
    $env:BACKEND_CMD = "npm run start:prod"
    $env:FRONTEND_CMD = "npm run start"
    
    Write-ColorOutput "检查生产环境配置..." "INFO"
    Check-ConfigFiles "prod"
}

# 检查 docker-compose 配置文件
if (-not (Test-Path $composeFile)) {
    Write-ColorOutput "找不到 ${composeFile} 配置文件" "ERROR"
    exit 1
}

# 如果需要构建
if ($Build) {
    Write-ColorOutput "开始构建${env}环境..." "INFO"
    
    Write-ColorOutput "停止并删除现有容器..." "INFO"
    docker compose -f $composeFile down
    
    if ($env -eq "prod") {
        Write-ColorOutput "构建生产环境容器..." "INFO"
        docker compose -f $composeFile build --no-cache
        
        Write-ColorOutput "清理Docker缓存..." "INFO"
        docker system prune -f
    }
    else {
        Write-ColorOutput "构建开发环境容器..." "INFO"
        docker compose -f $composeFile build --no-cache
    }
}

# 检查并创建alist文件夹及其结构
Check-AndCreateAlist

# 启动容器
Write-ColorOutput "启动${env}环境容器..." "INFO"
if ($env -eq "dev") {
    Write-ColorOutput "开发环境启动，日志将实时显示..." "WARNING"
    docker compose -f $composeFile up
}
else {
    Write-ColorOutput "生产环境启动，容器将在后台运行..." "INFO"
    docker compose -f $composeFile up -d
    
    Write-ColorOutput "容器状态：" "INFO"
    docker compose -f $composeFile ps
}

# 注册Ctrl+C处理
$null = Register-ObjectEvent -InputObject ([Console]) -EventName CancelKeyPress -Action {
    Write-ColorOutput "正在关闭容器..." "INFO"
    docker compose -f $composeFile down
    exit 0
}

# 如果是开发环境，等待用户输入
if ($env -eq "dev") {
    Wait-Event
} 