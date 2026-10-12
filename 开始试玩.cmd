@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js，将尝试直接打开离线单文件版。
  if exist "%~dp0dist\index.html" (
    start "" "%~dp0dist\index.html"
    echo 浏览器若限制本地存档，请改用 HTTP 方式试玩。
  ) else if exist "%~dp0legacy\index.html" (
    start "" "%~dp0legacy\index.html"
    echo 未找到构建产物 dist\index.html，已改为打开改造前的单文件基线 legacy\index.html。
    echo 注意：legacy 是历史版本，功能可能与当前源码不同；安装 Node.js 后可运行 npm run build 重新生成离线版。
  ) else (
    echo 未找到 dist\index.html 或 legacy\index.html，请先安装 Node.js 后运行 npm run dev。
  )
  pause
  exit /b
)
echo 正在启动本地服务器：http://127.0.0.1:8877/
start "" "http://127.0.0.1:8877"
node server.cjs
pause
