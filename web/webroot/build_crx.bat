FOR /F "usebackq tokens=2,* skip=2" %%L IN (
    `reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /v Path`
) DO SET chromepath=%%M

"%chromepath%/"chrome.exe --pack-extension=%CD%/guieditor