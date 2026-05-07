@echo off
REM Windows cmd.exe fallback for the pre-commit hook.
REM Most Windows git installs run hooks via Git Bash, so scripts/hooks/pre-commit
REM (the POSIX script) will already work. This .bat is a safety net for setups
REM that invoke hooks through cmd directly.

where gitleaks >nul 2>nul
if errorlevel 1 (
  echo pre-commit: gitleaks not found on PATH. Install it before committing. 1>&2
  echo   Releases: https://github.com/gitleaks/gitleaks/releases/latest 1>&2
  echo   Bypass (NOT recommended): git commit --no-verify 1>&2
  exit /b 1
)

for /f "delims=" %%i in ('git rev-parse --show-toplevel') do set REPO_ROOT=%%i
gitleaks protect --staged --redact -v --config="%REPO_ROOT%\.gitleaks.toml"
set STATUS=%ERRORLEVEL%

if %STATUS% NEQ 0 (
  echo. 1>&2
  echo pre-commit: gitleaks detected secrets in staged changes. Commit blocked. 1>&2
  echo   Resolve the findings above, then re-stage and commit. 1>&2
  echo   Bypass (NOT recommended): git commit --no-verify 1>&2
)

exit /b %STATUS%
