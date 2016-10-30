import pickle
import requests
import os

SERVER_ENDPOINT = "http://192.168.1.104/"
cachePath = '/var/tmp/pick'
payload = None
if(os.path.isfile(cachePath)):
    with open(cachePath, 'rb') as inFile:
        payload = pickle.load(inFile)
    os.remove(cachePath)
    print(payload)
    # requests.post(SERVER_ENDPOINT, data=payload)
else:
    print("no Cache")
