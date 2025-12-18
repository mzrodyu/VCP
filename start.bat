@echo off
chcp 65001 >nul
title VCPChat Web

echo ========================================
echo   VCPChat Web 启动脚本
echo ========================================
echo.

:: 检查 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3.9+
    pause
    exit /b 1
)

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)

:: 启动后端
echo [1/2] 正在启动后端服务...
cd /d "%~dp0backend"

:: 检查虚拟环境
if not exist "venv" (
    echo 正在创建虚拟环境...
    python -m venv venv
)

:: 激活虚拟环境并安装依赖
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

:: 在新窗口启动后端
start "VCPChat Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate.bat && python app.py"

:: 等待后端启动
timeout /t 3 /nobreak >nul

:: 启动前端
echo [2/2] 正在启动前端服务...
cd /d "%~dp0frontend"

:: 检查 node_modules
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
)

:: 在新窗口启动前端
start "VCPChat Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   启动完成！
echo   后端: http://localhost:5001
echo   前端: http://localhost:3000
echo ========================================
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:3000
