@echo off
setlocal

set youtubejs=https://github.com/LuanRT/YouTube.js
set ytdlp=https://github.com/yt-dlp/yt-dlp

for /f "tokens=*" %%i in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/LuanRT/YouTube.js/releases/latest | Select-Object -ExpandProperty tag_name"') do set youtubejs_folder-name=YouTube.js_%%i
for /f "tokens=*" %%j in ('powershell -command "Invoke-RestMethod https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest | Select-Object -ExpandProperty tag_name"') do set ytdlp_folder-name=yt-dlp_%%j

:first

echo [36m1[0m�FLuanRT/YouTube.js �݂̂� GitHub ����N���[�����܂��B
echo [36m2[0m�Fyt-dlp/yt-dlp �݂̂� GitHub ����N���[�����܂��B
echo [36m3[0m�F��L�̗����� GitHub ����N���[�����܂��B
echo �ȏ��3������s������������ԍ��œ��́F
set /p process=

if "%process%" == "1" (
    goto youtubejs
)

if "%process%" == "2" (
    goto ytdlp
)

if "%process%" == "3" (
    goto all
)

echo [33m�y���Ӂz[0m ���͂ł���l�́u1�v�u2�v�u3�v�̂����ꂩ�ł��B
echo.
goto first

:youtubejs
call :delete-youtubejs-folder

call git clone %youtubejs% %youtubejs_folder-name%
goto end

:ytdlp
call :delete-ytdlp-folder

call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:all
call :delete-youtubejs-folder
call :delete-ytdlp-folder

call git clone %youtubejs% %youtubejs_folder-name%
echo.
call git clone %ytdlp% %ytdlp_folder-name%
goto ytdlp-postprocess

:end
echo.
echo [32m�y�����z[0m �N���[�������͐���Ɋ������܂����B

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
        echo [32m�y�����z[0m �iYouTube.js�j�����̃t�H���_�͐���ɍ폜����܂����B
    )
)

goto youtubejs-folder-postprocess

:delete-ytdlp-folder
for /d %%D in (yt-dlp*) do (
    if exist %%D (
        rmdir /s /q %%D
        echo [32m�y�����z[0m �iyt-dlp�j�����̃t�H���_�͐���ɍ폜����܂����B
    )
)

:youtubejs-folder-postprocess
