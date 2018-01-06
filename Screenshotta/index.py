import base64
import requests
import os
from datetime import datetime
import webbrowser
import pyimgur
from prompt_toolkit import prompt
from prompt_toolkit.validation import Validator, ValidationError
from helpers import NameValidator, DescriptionValidator, BrowserValidator
from halo import Halo
from config import CLIENT_ID, CLIENT_SECRET

if __name__ == '__main__':
    print('\n📷 📸 📷 📸 📷 📸 📷 📸 📷 📸 📷 📸 📷 📸 ')
    print('SCREENSHOTTA')

    imageName = prompt(
        '    Enter a name for the image: ', validator=NameValidator())
    imageDescription = prompt(
        '    Enter a description for the image: ',
        validator=DescriptionValidator())
    openBrowser = prompt(
        '    Open in browser? [y/N] ',
        default='N',
        validator=BrowserValidator())

    spinner = Halo(
        text='Take a screenshot!',
        spinner={
            'interval': 200,
            'frames': [
                '📷',
                '📸',
                '📷',
                '📸',
            ]
        })
    spinner.start()

    t = imageName + '.png'

    os.system('screencapture -i ' + t)

    fileAdd = os.getcwd() + '/' + t

    spinner.succeed('File created!')

    spinner2 = Halo(text='Uploading to imgur...', color='yellow')
    spinner2.start()

    im = pyimgur.Imgur(CLIENT_ID)

    uploaded_image = im.upload_image(fileAdd, title=imageDescription)
    spinner2.succeed('Image successfully uploaded')
    print('    URL: {0}'.format(uploaded_image.link))
    print('    Size: {0:.2f}kB'.format(uploaded_image.size / 1024))
    print('    Dimensions: {0}x{1} (px)'.format(uploaded_image.width,
                                                uploaded_image.height))

    #os.remove(t)
    #print('Deleted File')

    print('📷 📸 📷 📸 📷 📸 📷 📸 📷 📸 📷 📸 📷 📸\n')

    if openBrowser.lower() == 'y':
        webbrowser.open_new_tab(uploaded_image.link)
