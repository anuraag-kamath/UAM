Clone the repository using:-

git clone https://<<USERNAME>>@bitbucket.org/m4vr1ck/uam.git

Go to the directory where the repository where the code is cloned.

Set process environment variables before proceeding:-
WINDOWS:-

set JWT_KEY="keyofyourchoice"

set UAM_PORT="<<PORT>>"

set EMAIL_ID="<<email id to be used for sending mails>>"

set EMAIL_PASSWORD = "<<password of email id to be used for sending mails>>";

set EMAIL_PROVIDER = "<<email id provider>>";



Once the variable is set, the server can be then started using either node app.js or nodemon app.js
