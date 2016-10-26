import os
import requests
import re
import subprocess
import time

MAC_FILE = "/var/tmp/req.txt"
CAPTURE_CMD = "sudo tcpdump -ni mon0 type mgt subtype probe-req > /var/tmp/req.txt"
SERVER_ENDPOINT = "http://"
SRC_MAC_PATTERN = re.compile("")
OPERATION_TIME = 900

if os.path.isfile(MAC_FILE):
    os.remove(MAC_FILE)
p = subprocess.Popen("exec" + CAPTURE_CMD, stdout=subprocess.PIPE, shell=True)
time.sleep(OPERATION_TIME)
p.kill()
macs = []
with open(MAC_FILE) as captured:
    for packet in captured:
        matches = SRC_MAC_PATTERN.findall(packet)
        if matches:
            macs.append(matches[0])
        else:
            print("no match in packet ", packet)
requests.post(SERVER_ENDPOINT, json=macs)
