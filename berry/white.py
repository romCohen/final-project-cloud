import pickle
import requests

SERVER_ENDPOINT = "http://192.168.1.104/"
payload = None

with open('/var/tmp/pick', 'rb') as inFile:
    payload = pickle.load(inFile)
print(payload)
# requests.post(SERVER_ENDPOINT, data=payload)