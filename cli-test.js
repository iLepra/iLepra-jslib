var lepralib = require('./lepra'),
    prompt = require('prompt');

var config = {
        login: '',
        pass: ''
    },

    onPostComment = function(){

    },
    postComment = function(){
        lepralib.post.addComment()
    },

    onGetComments = function(success){
        if(success){
            console.log('comments get ok!', lepralib.post.current, lepralib.post.comments.length, lepralib.post.newComments.length);
        }else{
            console.log('comments get fail!');
        }
    },
    getComments = function(){
        lepralib.post.getComments("1539191", '', null, onGetComments);
    },

    onGetGov = function(success){
        if(success){
            console.log('gov get ok!', lepralib.gov);
            getComments();
        }else{
            console.log('gov get fail!');
        }
    },
    getGov = function(){
        lepralib.gov.getCurrent(onGetGov);
    },

    onSendChatMessage = function(success){
        if(success){
            console.log('chat send ok!');
            getGov();
        }else{
            console.log('chat send fail!');
        }
    },
    sendChatMessage = function(){
        lepralib.chat.sendMessage("тестовый привет от робота!", onSendChatMessage);
    },

    // tests
    onGetChatMessages = function(success){
        if(success){
            console.log('chat get', lepralib.chat.messages.length);
            sendChatMessage();
        }else{
            console.log('chat get fail!');
        }
    },

    getChatMessages = function(){
        lepralib.chat.getMessages(onGetChatMessages);
    },

    onGetInbox = function(success){
        if(success){
            console.log('inbox get', lepralib.inboxPosts.length);
        }else{
            console.log('inbox get fail!');
        }
    },

    getInbox = function(){
        lepralib.getInbox(true, onGetInbox);
    },

    onGetFavourites = function(success){
        if(success){
            console.log('favs get', lepralib.favouritePosts.length);
            getInbox();
        }else{
            console.log('favs get fail!');
        }
    },

    getFavourites = function(){
        lepralib.getFavourites(onGetFavourites);
    },

    onGetMyStuff = function(success){
        if(success){
            console.log('mystuff get', lepralib.myStuffPosts.length);
            getFavourites();
        }else{
            console.log('mystuff get fail!');
        }
    },

    getMyStuff = function(){
        lepralib.getMyStuff(true, onGetMyStuff);
    },

    onSwitchLayout = function(success){
        if(success){
            console.log('switchLayout OK', lepralib.latestPosts.length);
            getMyStuff();
        }else{
            console.log('switchLayout fail!');
        }
    },

    switchLayout = function(){
        lepralib.switchLayout(0, onSwitchLayout);
    },

    onMorePosts = function(success){
        if(success){
            switchLayout();
            console.log('got more posts: ', lepralib.latestPosts.length);
        }else{
            console.log('error getting more posts');
        }
    },

    getMorePosts = function(){
        lepralib.getMorePosts(onMorePosts);
    },

    onPosts = function(success){
        if(success){
            console.log('got posts: ', lepralib.latestPosts.length);
            getMorePosts();
        }else{
            console.log('error getting posts');
        }
    },

    afterLoggedIn = function(){
        lepralib.getLastPosts(true, onPosts);
    },

    onLogin = function(success){
        if(success){
            console.log('logged in!');
            afterLoggedIn();
        }else{
            console.log('error logging in!');
        }
    },

    onInit = function (success) {
        if(success){
            console.log('authed');
            //afterLoggedIn();
            getComments();
        }else{
            console.log('not authed, please enter captcha');

            prompt.start();
            prompt.get(['captcha'], function (err, result) {
                if (err) { return console.log(err); }
                console.log('Command-line input received:');
                console.log('Captcha: ' + result.captcha);

                lepralib.tryLogin({
                    user: config.login,
                    pass: config.pass,
                    captcha: result.captcha,
                    save: 1
                }, onLogin);
            });
        }
    };

// enable debug
lepralib.config.debug = true;
// init
lepralib.init(onInit);