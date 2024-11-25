function initNavigator(){
    document.addEventListener('mousedown', e => {
        if(!(
            e.target.id == 'profile-btn' ||
            e.target.id == 'profile-sidebar' ||
            e.target.classList.contains('profile-item') ||
            e.target.classList.contains('profile-icon') ||
            e.target.classList.contains('profile-item-icon') ||
            e.target.classList.contains('profile-item-text')
        )){
            $_('profile-sidebar').classList.remove('active');
            $_('profile-sidebar').style.animation = 'slideOutTop 0.2s forwards';
        }
    })
    $_('profile-sidebar').style.animation = 'slideOutTop 0s forwards';
    $_('profile-btn').addEventListener('click', e => {
        $_('profile-sidebar').classList.toggle('active');
        if ($_('profile-sidebar').classList.contains('active')) {
            $_('profile-sidebar').style.animation = 'slideInTop 0.2s forwards';
        } else {
            $_('profile-sidebar').style.animation = 'slideOutTop 0.2s forwards';
        }
    })

    $_('search-inp').addEventListener('keydown', e => {
        if(e.code === 'Enter'){
            if(window.location.pathname !== '/main.html') window.location.href = `/main.html?q=${$_('search-inp').value}`
            else search($_('search-inp').value);
        }
    })
    $_('search-btn').addEventListener('click', e => {
        if(window.location.pathname !== '/main.html') window.location.href = `/main.html?q=${$_('search-inp').value}`
        else search($_('search-inp').value);
    })
}