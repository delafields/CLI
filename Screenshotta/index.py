import base64
import requests
import os
from datetime import datetime
import webbrowser
import pyimgur
from config import CLIENT_ID, CLIENT_SECRET

fileName = datetime.now().strftime('%Y-%m-%d%H:%M:%S')

t = fileName + '.png'

os.system('screencapture -i ' + t)
fileAdd = os.getcwd() + '/' + t

print(fileName, fileAdd)

im = pyimgur.Imgur(CLIENT_ID)
#PATH = './' + fileName
uploaded_image = im.upload_image(fileAdd, title="Uploaded with PyImgur")
print(uploaded_image.title)
print(uploaded_image.link)
print(uploaded_image.size)
print(uploaded_image.type)

###################################
# Screenshot & add to current dir #
###################################
#os.getcwd()

#os.system('')

#fileName = datetime.now().strftime('%Y-%m-%d%H:%M:%S')

#t = fileName + '.png'

#os.system('screencapture -i ' + t)
#fileadd = os.getcwd() + '/' + t

#fh = open(fileadd, 'rb')

#print(fileName)
