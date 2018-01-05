import base64
import requests
import os
from datetime import datetime
import webbrowser
import pyimgur
from prompt_toolkit import prompt
from prompt_toolkit.validation import Validator, ValidationError
from config import CLIENT_ID, CLIENT_SECRET


class NameValidator(Validator):
    def validate(self, document):
        if ' ' in document.text:
            raise ValidationError(
                message='Do not use spaces',
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


uploadName = prompt('Image name: ', validator=NameValidator())
uploadDescription = prompt(
    'Image description: ', validator=DescriptionValidator())

print('Image ', uploadName)
