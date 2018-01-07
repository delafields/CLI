### Screenshotta

Screenshots are a pain in the ass.

Normally you:

1. Screenshot
2. Either you
   2a) Move it from the desktop or
   2b) Go to an image sharing site
   2c) Upload it to the image sharing site
   2d) Get the link
   2e) Use the link
   2f) Delete the file from desktop

With this you

1. Type screenshotta in the terminal
2. Name the image, give it a description, choose whether or not to open it in the browser, choose whether you want it saved in your current directory
   and...

Wham, the image gets uploaded to imgur, you get the link, and the image locally if thats what ya want

##### Installation

`pip install pyimgur prompt_toolkit halo`
`touch config.py` (Keep keys private!)
Register the app on imgur
In config.py enter CLIENT_ID='<YOUR_CLIENT_ID>'
Either symlink or add a PATH to the script

##### Usage

Type `screenshotta` in the terminal
Follow the prompts

![Screenshot](https://i.imgur.com/mnZEVdv.png)

Note: Mac/Linux only
