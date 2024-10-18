@echo off
setlocal

set youtubejs=https://github.com/LuanRT/YouTube.js
set jinter=https://github.com/LuanRT/Jinter
set ytdlp=https://github.com/yt-dlp/yt-dlp

for /f "tokens=*" %%i in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/LuanRT/YouTube.js/releases/latest | Select-Object -ExpandProperty tag_name"') do set youtubejs_folder-name=YouTube.js_%%i
for /f "tokens=*" %%j in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/LuanRT/Jinter/releases/latest | Select-Object -ExpandProperty tag_name"') do set jinter_folder-name=Jinter_%%j
for /f "tokens=*" %%j in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest | Select-Object -ExpandProperty tag_name"') do set ytdlp_folder-name=yt-dlp_%%j

:first

echo [36m1[0m : Clone only LuanRT/YouTube.js from GitHub.
echo [36m2[0m : Clone only LuanRT/Jinter from GitHub.
echo [36m3[0m : Clone only yt-dlp/yt-dlp from GitHub.
echo [36m4[0m : Clone both of the above from GitHub.
echo Enter the number of the process you want to execute from the above three:
set /p process=

if "%process%" == "1" (
    goto youtubejs
)

if "%process%" == "2" (
    goto jinter
)

if "%process%" == "3" (
    goto ytdlp
)

if "%process%" == "4" (
    goto all
)

echo [33m[Warning][0m Values that can be entered are "1", "2", or "3".
echo.
goto first

:youtubejs
call :delete-youtubejs-folder

call git clone %youtubejs% %youtubejs_folder-name%
goto end

:jinter
call :delete-jinter-folder

call git clone %jinter% %jinter_folder-name%
goto end

:ytdlp
call :delete-ytdlp-folder

call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:all
call :delete-youtubejs-folder
call :delete-jinter-folder
call :delete-ytdlp-folder

call git clone %youtubejs% %youtubejs_folder-name%
echo.
call git clone %jinter% %jinter_folder-name%
echo.
call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:end
echo.
echo [32m[Success][0m Cloning process completed successfully.

pause
exit

:ytdlp-postprocess

cd %ytdlp_folder-name%
rmdir /s /q test
cd yt_dlp
cd extractor
for %%f in (*) do (
    if not "%%f"=="youtube.py" (
        del "%%f"
    )
)

goto end

:delete-youtubejs-folder
for /d %%D in (YouTube.js*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m[Success][0m ^(YouTube.js^) Existing folder successfully deleted.
    )
)

:delete-jinter-folder
for /d %%D in (Jinter*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m[Success][0m ^(Jinter^) Existing folder successfully deleted.
    )
)

:delete-ytdlp-folder
for /d %%D in (yt-dlp*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m[Success][0m ^(yt-dlp^) Existing folder successfully deleted.
    )
)