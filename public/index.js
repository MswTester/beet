function $(selector){return document.querySelector(selector)};
function $_(id){return document.getElementById(id)};
function $$(selector){return document.querySelectorAll(selector)};
function $$_(selector){return Array.from(document.querySelectorAll(selector))};

$_('profile-btn').addEventListener('click', e => {
    $_('profile-sidebar').classList.toggle('hidden')
})