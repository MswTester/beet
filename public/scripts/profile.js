let user = JSON.parse(localStorage.getItem('user')) || null;

function init(){
    const title = $_('profile-card-title');
    const followers = $_('profile-card-followers');
    const followButton = $_('profile-follow-btn');

    const userId = new URLSearchParams(window.location.search).get('id');

    followButton.addEventListener('click', e => {
        if(userId){
            // follow
        }
    })
    
    // login 되어있는 경우
    if(user){
        // 남의 프로필일 경우
        if(userId){
            // 팔로우 되어있는 경우
            getUser(userId).then(_user => {
                title.textContent = user.name;
                followers.textContent = `Followers ${user.followers}`;
            })
            if(user.following.includes(userId)){
                followButton.classList.add('unfollow')
            }
        } else {
            getUser(user.id).then(_user => {
                title.textContent = user.name;
                followers.textContent = `Followers ${user.followers}`;
            })
            followButton.classList.add('hidden')
        }
    }

}