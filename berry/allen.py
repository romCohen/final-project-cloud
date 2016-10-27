import requests
import re
import subprocess

MAC_FILE = "/var/tmp/req.txt"
SERVER_ENDPOINT = "http://192.168.1.104/"
SRC_MAC_PATTERN = re.compile("([\dA-F]{2}(?:[-:][\dA-F]{2}){5})")
OPERATION_TIME = 40
CAPTURE_CMD = "sudo timeout " + str(OPERATION_TIME) + " tcpdump  -i mon0 -ni mon0 type mgt subtype probe-req"

with open(MAC_FILE, 'w') as macfile:
    p = subprocess.Popen(CAPTURE_CMD, stdout=macfile, shell=True)
    p.communicate()

macs = []
with open(MAC_FILE, 'r') as captured:
    print("1111", captured.read())
    for packet in captured:
        print(packet)
        matches = SRC_MAC_PATTERN.findall(packet)
        if matches:
            macs.append(matches[0])
        else:
            print("no match in packet ", packet)
print("macs", macs)
#requests.post(SERVER_ENDPOINT, json=macs)
