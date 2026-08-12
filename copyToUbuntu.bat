@echo off
cd /d C:\Cabinet

tar --exclude=CabinetReact/.git ^
    --exclude=CabinetReact/node_modules ^
    --exclude=CabinetReact/dist ^
    -czf - CabinetReact | ssh user@192.168.7.233 "rm -rf /home/user/Programs/CabinetReact && cd /home/user/Programs && tar -xzf -"

pause