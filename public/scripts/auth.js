function checkName(str){
    return (str.match(/^[a-zA-Z0-9_]{3,11}$/) && str.trim() != '')
}

function checkPassword(str){
    return (str.match(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_\-+=~]{6,}$/) && str.trim() != '')
}

function init(){
    const processBtn = $_('login-register-btn')
    const pageRoute = window.location.pathname === '/login.html' ? 'login' : 'register';

    function setError(text){
        $_(`${pageRoute}-errorline`).textContent = text;
    }

    $_(`${pageRoute}-name`).addEventListener('input', e => setError(''))
    $_(`${pageRoute}-pass`).addEventListener('input', e => setError(''))
    if(pageRoute === 'register') $_('register-pass-check').addEventListener('input', e => setError(''))

    processBtn.addEventListener('click', e => {
        if(!checkName($_(`${pageRoute}-name`).value)) return setError('Incorrect username');
        if(!checkPassword($_(`${pageRoute}-pass`).value)) return setError('Incorrect password');
        if(pageRoute == 'login'){
            login($_('login-name').value, $_('login-pass').value).then(data => {
                if(data.error){
                    setError(data.error)
                } else {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/main.html'
                }
            })
        } else {
            if($_('register-pass').value !== $_('register-pass-check').value) return setError('Password doesn\'t match')
            register($_('register-name').value, $_('register-pass').value).then(data => {
                if(data.error){
                    setError(data.error)
                } else {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/main.html'
                }
            })
        }
    })
}

addEventListener('DOMContentLoaded', init)