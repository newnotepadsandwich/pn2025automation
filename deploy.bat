@echo off
echo.
echo ============================================
echo    POCKIE NINJA SCRIPTS HUB DEPLOYMENT
echo ============================================
echo.
echo Your website is ready to deploy!
echo.
echo STEP 1: Open your GitHub repository
echo https://github.com/newnotepadsandwich/info.hack
echo.
echo STEP 2: Click "Add file" then "Upload files"
echo.
echo STEP 3: Drag ALL these files into GitHub:
echo.
dir /b
echo.
echo STEP 4: Write commit message: "🚀 Deploy Pockie Ninja Scripts Hub v1.0"
echo.
echo STEP 5: Click "Commit changes"
echo.
echo STEP 6: Enable GitHub Pages:
echo - Go to Settings ^> Pages
echo - Select "Deploy from branch"
echo - Choose "main" branch
echo - Click "Save"
echo.
echo Your site will be live at:
echo https://newnotepadsandwich.github.io/info.hack/
echo.
echo ============================================
echo Press any key to open GitHub repository...
pause >nul
start https://github.com/newnotepadsandwich/info.hack
