@echo off
echo ======================================================================
echo           AEGISVOTE: PRIVACY-PRESERVING CONSORTIUM E-VOTING
echo     Hyperledger Fabric • Paillier Homomorphic Tally • Circom ZKP
echo ======================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AegisVote FastAPI Backend" cmd /k "cd backend && .\.venv\Scripts\python.exe start_server.py"

echo [2/2] Starting React Frontend on http://127.0.0.1:3000 ...
start "AegisVote Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo System successfully launched!
echo - Web Application: http://localhost:3000
echo - Interactive Swagger API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
pause

