#!/bin/bash

################################################################################
#
# This script is just an easy way to start the server and client in one command
#
# 1. Kill any running server processes
# 2. Kill any running client processes
# 3. Sleep for 3 seconds to give the kill commands a chance to finish
# 4. Start up the server process
# 5. Wait 15 seconds for user to input credentials (only really required for Ubuntu I think)
#           If the user fails to enter credentials within the 15 second timeframe this script
#           will exit.. you'll have to start it up again and be faster next time ;)
# 6. Start up client process with LIFX light type - Hue support to come later
#
################################################################################

print_help() {
cat << EOF
Usage: ${0##*/} [-hc]
Starts flic server and starts up button client

    -h          display this help and exit
    -c          start client in config mode. Config mode retrieves light data and prints to console
EOF
}

config_mode_on=false

while getopts "hc" opt; do
    case $opt in
        h)
          print_help
          exit 0
          ;;
        c)
          config_mode_on=true
          ;;
        *)
          print_help
          exit 1
          ;;
    esac
done

# Kill any running server processes
if ps aux | grep '[f]licd' &> /dev/null; then
    sudo kill $(ps aux | grep '[f]licd' | awk '{print $2}');
fi

# Kill any running client processes
if ps aux | grep 'lifxclient' &> /dev/null; then
    sudo kill $(ps aux | grep 'lifxclient' | awk '{print $2}');
fi

#if ps aux | grep '[s]impleclient' &> /dev/null; then
#    sudo kill $(ps aux | grep '[s]impleclient' | awk '{print $2}');
#fi

# Need to sleep here before starting up the server process so it isn't killed by commands above
sleep 3

# Start server in separate terminal - supports ubuntu for testing purposes
if [[ $(arch) == "x86_64" ]]; then
     pushd bin/x86_64 &> /dev/null
     gnome-terminal -e 'sudo ./flicd -f flic.sqlite3'
     popd &> /dev/null
elif [[ $(arch) == "armv7l" ]]; then
     pushd bin/armv6l &> /dev/null
     lxterminal -e 'sudo ./flicd -f flic.sqlite3'
     popd &> /dev/null
else
    echo "Unsupported OS"
    exit
fi

echo "The server has been launched in another terminal."

node clientlib/nodejs/lifxclient.js

# Start up light control client using voltos LIFXToken bundle.
# Make sure you have set TOKEN in your voltos bundle to
# your LIFX cloud token from cloud.lifx.com.
# Instructions for using voltos found at voltos.io
#voltos use LIFXToken

#if $config_mode_on; then
#    voltos run "python3 clientlib/client.py -c LIFX"
#else
#    voltos run "python3 clientlib/client.py LIFX"
#fi
