function onTab(){
    $_('tab-background').style.animation = 'tabBgIn 0.2s forwards';
    $_('tab-layout-main').style.animation = 'tabIn 0.2s forwards';
}

function offTab(){
    $_('tab-background').style.animation = 'tabBgOut 0.2s forwards';
    $_('tab-layout-main').style.animation = 'tabOut 0.2s forwards';
}

function initTabLayout(){
    $_('tab-background').style.animation = 'tabBgOut 0s forwards';
    $_('tab-layout-main').style.animation = 'tabOut 0s forwards';
    $_('menu-btn').addEventListener('click', e => {
        onTab();
    })
    $_('tab-background').addEventListener('mousedown', e => {
        if(e.target === e.currentTarget){
            offTab();
        }
    })
    $_('tab-home').addEventListener('click', e => {
        offTab();
        if(window.location.pathname !== '/main.html') window.location.href = '/main.html';
        else getHome();
    })
}