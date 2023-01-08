#!/bin/bash

echo $1

resource='ResourceAware'
default='Default'
vstorm = 'VStorm'

scheduler = 'vStorm'

if [ $1 = $resource ]
then
scheduler="resource.ResourceAwareScheduler"
elif [ $1 = $default ]
then
scheduler="DefaultScheduler"
elif [ $1 = $vstorm ]
then
scheduler="vStorm"
fi


# # Assign the filename
# filename="storm.yaml"

# # Take the search string
# read -p "Enter the search string: " search

# # Take the replace string
# read -p "Enter the replace string: " replace

# if [[ $search != "" && $replace != "" ]]; then
# sed -i "s/$search/$replace/" $filename
# fi
new_line='storm.scheduler: "org.apache.storm.scheduler.'$scheduler'"'
# new_line='storm.scheduler: "org.apache.storm.scheduler.vStorm"'
lineno="29"
targetfile="storm.yaml"

gnome-terminal  --command="bash -c 'cd ../../conf/; sed -i \"${lineno} c\\${new_line}\" \"${targetfile}\";$SHELL'"

