@echo off
REM Research OS Auto-Agent Wrapper for Windows Task Scheduler
REM This batch file runs the auto-agent script with proper environment

cd /d "C:\Users\aaaut\research-os"

REM Set up environment
set PATH=C:\Users\aaaut\AppData\Local\hermes\tools\node-26.7.0-win32-x64;C:\Users\aaaut\AppData\Local\Microsoft\WinGet\Links;%PATH%
set NODE_ENV=production

REM Run the auto-agent script
bash auto-agent.sh >> logs/auto-agent/scheduler.log 2>&1

REM Log completion
echo [%date% %time%] Auto-agent cycle completed >> logs/auto-agent/scheduler.log