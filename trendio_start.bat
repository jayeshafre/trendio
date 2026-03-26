@echo off

echo Starting Trendio Project...

:: Start Backend
echo Starting Backend Server...
cd /d C:\Users\jayesh\Desktop\trendio\backend
call venv\Scripts\activate
start cmd /k python manage.py runserver

:: Start Frontend
echo Starting Frontend Server...
cd /d C:\Users\jayesh\Desktop\trendio\frontend\trendio-frontend
start cmd /k npm run dev

echo All services started!
pause