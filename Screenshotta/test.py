import webbrowser
import pyimgur
from config import CLIENT_ID, CLIENT_SECRET

im = pyimgur.Imgur(CLIENT_ID, CLIENT_SECRET)
im.create_album("An authorized album", "Cool stuff!")
