import requests
import re
import subprocess
import time
import pickle
#CONFIG
CLASSROOM = 1
###

def restart():
    command = "/usr/bin/sudo /sbin/shutdown -r now"
    process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
    output = process.communicate()[0]
    print(output)

MAC_FILE = "/var/tmp/req.txt"
SERVER_ENDPOINT = "http://192.168.1.104/"
OPERATION_TIME = 40
CAPTURE_CMD = "sudo timeout " + str(OPERATION_TIME) + " tcpdump -e -i mon0 -ni mon0 type mgt subtype probe-req"
MAC_LENGTH = 17

subprocess.call('sudo airmon-ng start wlan0', shell=True)
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
with open('/var/tmp/pick', 'wb') as outfile:
    pickle.dump(payload, outfile)
# requests.post(SERVER_ENDPOINT, data=payload)
#restart()



