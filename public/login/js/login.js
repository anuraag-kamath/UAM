document.getElementById('login').addEventListener('click', (ev) => {
    if (document.getElementById('username').value.length > 0 && document.getElementById('password').value.length > 0) {
        loadBar();
        ev.preventDefault();
        document.getElementById('login').disabled = true;
        document.getElementById('register').disabled = true;
        document.getElementById('sendActivationLink').disabled = true;
        document.getElementById('resetPassword').disabled = true;

        loginRegister("login");
    } else {
        document.getElementById('login').disabled = false;
        document.getElementById('register').disabled = false;
        document.getElementById('sendActivationLink').disabled = false;
        document.getElementById('resetPassword').disabled = false;

        document.getElementById('mess').innerText = "Username and Password are mandatory fields";
        document.getElementById('mess').style.visibility = "visible"
        removeLoadBar();

    }


})

document.getElementById("username").addEventListener('focus', (ev) => {
    document.getElementById('mess').innerText = "";
    document.getElementById('mess').style.visibility = "hidden"
});

document.getElementById("password").addEventListener('focus', (ev) => {
    document.getElementById('mess').innerText = "";
    document.getElementById('mess').style.visibility = "hidden"
});


document.getElementById("reg_email").addEventListener('focus', (ev) => {
    document.getElementById('mess').innerText = "";
    document.getElementById('mess').style.visibility = "hidden"
});


document.getElementById('register').addEventListener('click', (ev) => {
    loadBar();

    ev.preventDefault();
    if (document.getElementById('username').value.length > 0 && document.getElementById('password').value.length > 0 && document.getElementById('reg_email').value.length > 0) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(document.getElementById('reg_email').value) == false) {
            document.getElementById('login').disabled = false;
            document.getElementById('register').disabled = false;
            document.getElementById('sendActivationLink').disabled = false;
            document.getElementById('resetPassword').disabled = false;


            document.getElementById('mess').innerText = "Invalid Email ID";
            document.getElementById('mess').style.visibility = "visible"
            removeLoadBar();
        } else {
            document.getElementById('login').disabled = true;
            document.getElementById('register').disabled = true;
            document.getElementById('sendActivationLink').disabled = true;
            document.getElementById('resetPassword').disabled = true;


            loginRegister("register");

        }

    }
    else {
        document.getElementById('login').disabled = false;
        document.getElementById('register').disabled = false;
        document.getElementById('sendActivationLink').disabled = false;
        document.getElementById('resetPassword').disabled = false;


        document.getElementById('mess').innerText = "Username, Password and email id are mandatory fields";
        document.getElementById('mess').style.visibility = "visible"
        removeLoadBar();

    }
})

document.getElementById('sendActivationLink').addEventListener('click', (ev) => {
    loadBar();
    document.getElementById('login').disabled = true;
    document.getElementById('register').disabled = true;
    document.getElementById('sendActivationLink').disabled = true;
    document.getElementById('resetPassword').disabled = true;



    ev.preventDefault();
    var bodyJSON = '{"email":"' + document.getElementById('reg_email').value + '"}'

    if (document.getElementById('reg_email').value.length > 0) {
        fetch('/api/uam/resendActivationLink', {
            credentials: "include",
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: bodyJSON
        }).then((prom) => prom.text()).then((res) => {
            res = JSON.parse(res);
            document.getElementById('mess').innerText = res.message;
            document.getElementById('mess').style.visibility = "visible"
            document.getElementById('login').disabled = false;
            document.getElementById('register').disabled = false;
            document.getElementById('sendActivationLink').disabled = false;
            document.getElementById('resetPassword').disabled = false;


            removeLoadBar();
        })

    }
    else {
        document.getElementById('login').disabled = false;
        document.getElementById('register').disabled = false;
        document.getElementById('sendActivationLink').disabled = false;
        document.getElementById('resetPassword').disabled = false;


        document.getElementById('mess').innerText = "Registered Email address is mandatory for re-sending activation link";
        document.getElementById('mess').style.visibility = "visible"
        removeLoadBar();

    }
})


document.getElementById('resetPassword').addEventListener('click', (ev) => {
    loadBar();
    document.getElementById('login').disabled = true;
    document.getElementById('register').disabled = true;
    document.getElementById('sendActivationLink').disabled = true;
    document.getElementById('resetPassword').disabled = true;



    ev.preventDefault();
    var bodyJSON = '{"email":"' + document.getElementById('reg_email').value + '"}'

    if (document.getElementById('reg_email').value.length > 0) {
        fetch('/api/uam/resetPassword', {
            credentials: "include",
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: bodyJSON
        }).then((prom) => prom.text()).then((res) => {
            res = JSON.parse(res);
            document.getElementById('mess').innerText = res.message;
            document.getElementById('mess').style.visibility = "visible"
            document.getElementById('login').disabled = false;
            document.getElementById('register').disabled = false;
            document.getElementById('sendActivationLink').disabled = false;
            document.getElementById('resetPassword').disabled = false;


            removeLoadBar();
        })

    }
    else {
        document.getElementById('login').disabled = false;
        document.getElementById('register').disabled = false;
        document.getElementById('sendActivationLink').disabled = false;
        document.getElementById('resetPassword').disabled = false;


        document.getElementById('mess').innerText = "Registered Email address is mandatory for re-sending activation link";
        document.getElementById('mess').style.visibility = "visible"
        removeLoadBar();

    }
})


loginRegister = (type) => {
    jsonBody = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('reg_email').value
    }
    fetch('/api/uam/' + type, {
        method: 'POST',
        headers: {

            'content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(jsonBody)
    }).then((prom) => {
        return prom.text();
    }).then((res) => {
        res = JSON.parse(res)
        document.getElementById('login').disabled = false;
        document.getElementById('register').disabled = false;
        document.getElementById('sendActivationLink').disabled = false;
        document.getElementById('resetPassword').disabled = false;

        if (res.error != undefined && res.error != "undefined" && res.error.length > 0) {
            document.getElementById('mess').innerText = res.error;
            document.getElementById('mess').style.visibility = "visible"

        }
        else if (res.token != undefined) {
            localStorage.setItem('spm_token', res.token);
            document.getElementById('login').disabled = true;
            document.getElementById('register').disabled = true;
            document.getElementById('sendActivationLink').disabled = true;
            document.getElementById('resetPassword').disabled = true;
            if (window.location.href.indexOf('login') == -1) {
                window.location.reload();

            } else {
                window.location.href = res.url;
            }

        } else if (res.deactivated == true) {
            document.getElementById('mess').innerText = "User deactivated";
            document.getElementById('mess').style.visibility = "visible"

        } else if (res.notactivated == true) {
            document.getElementById('mess').innerText = "User not yet activated!";
            document.getElementById('mess').style.visibility = "visible"

        } else if (res.registeredButNotActivated == true) {
            document.getElementById('mess').innerText = "Check your inbox for the activation link!";
            document.getElementById('mess').style.visibility = "visible"
        } else {
            document.getElementById('mess').innerText = "Invalid username/password";
            document.getElementById('mess').style.visibility = "visible"

        }
        removeLoadBar();
    })
}

document.getElementById("login").addEventListener('mouseout', (ev) => {
    try {
        document.getElementById('test').parentNode.removeChild(document.getElementById('test'))
    }
    catch (e) {

    }
});

document.getElementById("register").addEventListener('mouseout', (ev) => {
    try {
        document.getElementById('test').parentNode.removeChild(document.getElementById('test'))
    }
    catch (e) {

    }
});



loadBar = () => {
    loadIt = true
    var elem = document.getElementById("loading");
    document.getElementById("loading").style.visibility = "visible"
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
        if (loadIt == false) {
            clearInterval(id);
        }
        if (width >= 100) {
            width = 1;
        } else {
            width++;

            elem.style.width = (width) + '%';
        }
    }
}

removeLoadBar = () => {
    loadIt = false;
    document.getElementById("loading").style.visibility = "hidden";
}