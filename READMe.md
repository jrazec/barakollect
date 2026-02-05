# INSTALLATION
**This guide requires you to base on the GDRIVE Link where the zip files, .env variables and req.txt are located.**
## Pre-Requirements
Make sure you have these installed first before going to the installation of dependencies process:
1. **WSL**, [OPTIONAL] the steps here expects you are using Windows Subsystem or Linux/Mac; if not yet, go to this tutorial: https://learn.microsoft.com/en-us/windows/wsl/install
2. Download Python
3. Download Nodejs
## Installation
1. Refer on the [GDRIVE](https://drive.google.com/drive/folders/11Bo61XUgArbzdSmtulwyO-D5qrhmVgzl?fbclid=IwY2xjawPxM3NleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEel_VsBsSOF20EREFG2BZQw4O0V8annIQERyivtOS6WXDw0xehb7jttvXcmWU_aem_DaCOJg5uWYPD85x1uaOq2Q), download the barakollect-main.zip
2. Unzip it 
3. Open VS Code and find the WSL Extension [Watch here for steps](https://youtu.be/q74CP4fB7cY?si=184bRloJI_17e7q7)
4. Then open the file in WSL VSCODE.
5. In the Frontend folder in Gdrive, download the .env file, put it in the client/ in the vs code.
6. do _CTRL + SHIFT + `_ or just open terminal
7. type `cd client/ && npm i`
8. Then run it, `npm run dev`
9. Then for the the Backend folder in Gdrive, download the req.txt and .env files (disregard the .venv as its slow to download)
10. Rename the env file to .env then move to server in vscode also the req.txt
11. Then open another terminal
12. Then `cd server`
13. Create the env variable `python -m venv venv`
14. Activate it `source venv/bin/activate`
15. Install all dependencies:
    `sudo apt-get update`
    `pip install -r req.txt`
16. Install GDAL
    `sudo apt-get install -y gdal-bin libgdal-dev`
    `pip install GDAL==$(gdal-config --version) --no-binary GDAL`
17. Then run the backend: `python manage.py runserver`
All done!

## RUNNING THE APP LOCALLY - IF ALREADY INSTALLED
1. Open Ubuntu WSL
2. Go to Barakollect folder directory `cd barakollect/barakollect/`
3. Open in vscode `code .`
4. Go to frontend **CTRL + SHIFT + `**
5. then type `cd client`
6. Type `npm run dev`
7. Go to backend `cd .. && cd server`
8. Activate venv `source .\venv\bin\activate`
9. Run the backend `python manage.py runserver`


