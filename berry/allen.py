import os
import requests
import re
import subprocess
import time
#CONFIG
CLASSROOM = 1
###
MAC_FILE = "/var/tmp/req.txt"
SERVER_ENDPOINT = "http://192.168.1.104/"
OPERATION_TIME = 40
CAPTURE_CMD = "sudo timeout " + str(OPERATION_TIME) + " tcpdump -e -i mon0 -ni mon0 type mgt subtype probe-req"
MAC_LENGTH = 17
with open(MAC_FILE, 'w') as macfile:
    p = subprocess.Popen(CAPTURE_CMD, stdout=macfile, shell=True)
    p.communicate()
macs = []

with open(MAC_FILE, 'r') as captured:
    for packet in captured:
        if(len(packet)>MAC_LENGTH):
            idx = packet.index("SA:") + 3
            print(packet[idx: idx + MAC_LENGTH])
            if idx > 0:
                macs.append(packet[idx: idx + MAC_LENGTH])
            else:
                print("no match in packet ", packet)

macs = list(set(macs))
print("macs", macs)
payload = {"class":CLASSROOM, "students":macs}
requests.post(SERVER_ENDPOINT, data=payload)
