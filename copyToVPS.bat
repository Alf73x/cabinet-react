@echo on

cd /d C:\Cabinet

tar --exclude=CabinetReact/.git ^
    --exclude=CabinetReact/node_modules ^
    --exclude=CabinetReact/dist ^
    -czf - CabinetReact | ssh cabinet-vps "mkdir -p /root/Programs && rm -rf /root/Programs/CabinetReact && cd /root/Programs && tar -xzf -"

pause