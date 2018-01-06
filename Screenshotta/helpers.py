import base64
import requests
import os
from datetime import datetime
import webbrowser
import re
import pyimgur
from prompt_toolkit import prompt
from prompt_toolkit.validation import Validator, ValidationError
from config import CLIENT_ID, CLIENT_SECRET


class NameValidator(Validator):
    def validate(self, document):
        if re.search(r'[\\/:"*?<>|\s]+', document.text) is not None:
            raise ValidationError(
                message=
                'Do not include /, \\, :, \", \', *, ?, <, >, |, or whitespace ',
                cursor_position=len(document.text))

        if not document.text:
            raise ValidationError(
                message='Please enter a name',
                cursor_position=len(document.text))


class DescriptionValidator(Validator):
    def validate(self, document):
        if not document.text:
            raise ValidationError(
                message='Please enter a description',
                cursor_position=len(document.text))


class BrowserValidator(Validator):
    def validate(self, document):
        if not document.text:
            raise ValidationError(
                message='Please enter either y or n',
                cursor_position=len(document.text))

        if 'n' not in document.text.lower() and 'y' not in document.text.lower(
        ):
            raise ValidationError(
                message='Please enter either y or n',
                cursor_position=len(document.text))


#uploadName = prompt('Image name: ', validator=NameValidator())
#uploadDescription = prompt('Image description: ', validator=DescriptionValidator())
#openBrowser = prompt('Open in browser? [y/N] ', default='N', validator=BrowserValidator())

#print('openBrowser? ', openBrowser)
