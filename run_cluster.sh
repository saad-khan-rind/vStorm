#!/usr/bin/bash

gnome-terminal  --command="bash -c 'echo Zk Server Starting...;zkServer.sh start; $SHELL'"
gnome-terminal  --command="bash -c 'echo Storm Nimbus Starting...;storm nimbus; $SHELL'"
gnome-terminal  --command="bash -c 'echo Storm Supervisor Starting...;storm supervisor; $SHELL'"
gnome-terminal  --command="bash -c 'echo Storm UI Starting...;storm ui;storm ui -- open; $SHELL'"
google-chrome http://localhost:8090

