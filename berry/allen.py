import os
import requests
import re

MAC_FILE = "/var/tmp/req.txt"
CAPTURE_CMD = "sudo tcpdump -ni mon0 type mgt subtype probe-req > /var/tmp/req.txt"
SERVER_ENDPOINT = "http://"
SRC_MAC_PATTERN = re.compile("")
if __name__ == "main":
    os.remove(MAC_FILE)
    os.system(CAPTURE_CMD)
    macs = []
    with open(MAC_FILE) as captured:
        for packet in captured:
            matches = SRC_MAC_PATTERN.findall(packet)
            if matches:
                macs.append(matches[0])
            else:
                print("no match in packet ", packet)
    requests.post(SERVER_ENDPOINT, json=macs)
