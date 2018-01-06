import os
import re
from prompt_toolkit.validation import Validator, ValidationError


class NameValidator(Validator):
    def validate(self, document):
        text = document.text
        # ensure some type of input
        if not text:
            raise ValidationError(
                message='Please enter a name', cursor_position=len(text))

        # ensures accepted file characters are used
        if re.search(r'[\\/:"*?<>|\s]+', text) is not None:
            raise ValidationError(
                message=
                'Do not include /, \\, :, \", \', *, ?, <, >, |, or whitespace',
                cursor_position=len(text))

        # ensures img name doesn't already exist
        if os.path.isfile('./{0}.png'.format(text)):
            raise ValidationError(
                message="file already exists", cursor_position=len(text))


class DescriptionValidator(Validator):
    def validate(self, document):
        # ensures some type of input
        text = document.text
        if not text:
            raise ValidationError(
                message='Please enter a description',
                cursor_position=len(text))


class YesNoValidator(Validator):
    def validate(self, document):
        # ensures some type of input
        text = document.text
        if not text:
            raise ValidationError(
                message='Please enter either y or n',
                cursor_position=len(text))

        # ensures input is either y/Y or n/N
        if 'n' not in text.lower() and 'y' not in text.lower():
            raise ValidationError(
                message='Please enter either y or n',
                cursor_position=len(text))
