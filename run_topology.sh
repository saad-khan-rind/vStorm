#!/usr/bin/bash

echo $1
echo $2
echo $3

filename=$1
classpath=$2
classname=$3


gnome-terminal  --command="bash -c 'echo Tropology Starting...;storm jar $filename $classpath $classname; $SHELL'"