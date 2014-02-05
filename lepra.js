// requires
var request = require('request');
var colors = require('colors');

// init main object
var iLepra = {};

// lepralib utility pieces
var leprautil = require('./lib/lepra.util');

// last fetch times for stuff
var cacheTime = 30 * 60000;
var lastPostFetchTime = null;
var myStuffFetchTime = null;
var inboxFetchTime = null;
var myStuffOldNew = {c:null, p:null};
var inboxOldNew = {c:null, p:null};

/**
 * Override console.log() to only render if debug is on
 */
var originalLog = console.log;
console.log = function() {
    if(iLepra.config.debug) {
        Array.prototype.unshift.call(arguments, '[leprabox] '.white);
        originalLog.apply(this, arguments);
    }
};

/***
 Add cookie to default request
 ***/
var fillRequestWithCookies = function(cookies){
    var j = request.jar();
    var i, len = cookies.length;

    // fill container with cookies
    for(i = 0; i < len; i++) {
        j.add(request.cookie(cookies[i]));
    }

    // replace default request with new one with cookies
    request = request.defaults({jar: j});
};


/***
 Processes given html string for captcha data
 ***/
var processCaptcha = function(source){
    var captchaReg = /img alt="captcha" src="(.+?)"/g,
        loginReg = /<input type="hidden" name="logincode" value="(.+?)"/g;

    iLepra.captchaURL = 'http://leprosorium.ru' + captchaReg.exec(source)[1];
    iLepra.loginCode = loginReg.exec(source)[1];

    console.log('got captcha'.green, iLepra.captchaURL, iLepra.loginCode);
};

/***
 Processes given html string for user's data
 ***/
var processMain = function(data){
    // cleanup data
    data = data.replace(/\n+/g, '');
    data = data.replace(/\r+/g, '');
    data = data.replace(/\t+/g, '');
    // get post vote wtf
    iLepra.postVoteWTF = /wtf_vote = '(.+?)'/g.exec(data)[1];
    // get mystuff wtf
    iLepra.myStuffWTF = /mythingsHandler.wtf = '(.+?)'/g.exec(data)[1];
    // get chat wtf
    iLepra.chat.wtf = /chatHandler.wtf = '(.+?)'/g.exec(data)[1];
    // get username
    iLepra.username = /<div id="greetings" class="columns_wrapper">.+?<a href=".+?">(.+?)<\/a>/g.exec(data)[1];
    // logout wtf
    iLepra.logoutWTF = /name="wtf" value="(.+?)"/g.exec(data)[1];
    // get sublepras
    iLepra.userSubLepras = [];

    // vars
    var subReg, res, sublepra;

    // sub lepra regex
    subReg = /<div class="sub"><strong class="logo"><a href="(.+?)" title="(.*?)"><img src="(.+?)" alt=".+?" \/>.+?<div class="creator">.+?<a href=".*?\/users\/.+?">(.+?)<\/a>/g;

    // get them all
    res = subReg.exec(data);
    while(res !== null){
        sublepra = {
            name: res[2],
            creator: res[4],
            link: res[1],
            logo: res[3]
        };
        iLepra.userSubLepras.push(sublepra);

        res = subReg.exec(data);
    }
};

var getLastId = function(){
    var last = '',
        biggestId, i;
    if (iLepra.chat.messages.length > 0) {
        biggestId = 0;
        for(i in iLepra.chat.messages ){
            if (parseInt(iLepra.chat.messages[i].id, 10) > biggestId)
                biggestId = parseInt(iLepra.chat.messages[i].id, 10);
        }
        if (biggestId !== 0) last = biggestId;
    }
    return last;
};

/**
 ** Main iLepra class that handles all the logic
 */
iLepra = {
    // include loaded pieces
    util: leprautil,

    // config
    config: {
        debug: false,
        screenBiggest: 800
    },

    //
    // vars
    //

    // auth stuff
    isAuthenticated: false,
    loginCode: null,
    captchaURL: null,
    // current cookies
    cookies: null,

    // error message
    errorMessage: null,

    // user data
    username: null,
    userSubLepras: null,

    // news data
    inboxNewPosts: null,
    inboxNewComments: null,
    karma: null,
    rating: null,
    voteweight: null,
    myNewComments: null,
    myNewPosts: null,

    // posts data
    latestPosts: null,
    postCount: null,
    postVoteWTF: null,

    // mystuff data
    myStuffPosts: null,
    myStuffWTF: null,
    // fav data
    favouritePosts: null,
    // inbox data
    inboxPosts: null,
    // logoyt wtf
    logoutWTF: null,

    //
    // functions
    //

    /***
     Initializes iLepra for work, checks if user is
     logged in, gets captcha if not and posts if yes
     ***/
    init: function(cookies, callback) {
        // add cookies to request if some are given
        if(cookies) {
            fillRequestWithCookies(cookies);
        }

        // get lepra
        request({url: 'http://leprosorium.ru'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error init:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // report prgoress
            console.log('init loaded'.green);

            if(data.indexOf('<input type="password"') > 0){
                console.log('not authed, getting captcha'.yellow);

                processCaptcha(data);
                iLepra.isAuthenticated = false;

                // callback
                callback(false);
            }else{
                console.log('authed ok! getting main page'.green);

                //iLepra.getLastPosts();
                iLepra.isAuthenticated = true;

                // process user's data
                processMain(data);

                // callback
                callback(true);
            }
        });
    },

    /***
     Tries logging in with given data
     ***/
    tryLogin: function(data, callback){
        data.logincode = this.loginCode;

        console.log('logging in with: '.yellow, data);

        request.post({url: 'http://leprosorium.ru/login/', followAllRedirects:true, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error logging in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('login loaded without error'.green);

            if(data.indexOf('class="error"') > 0){
                // get error
                var errorReg = /<div class="error">(.+?)<\/div>/g;
                iLepra.errorMessage = errorReg.exec(data)[1];

                // get new captcha
                processCaptcha(data);

                // dispatch error event and die
                console.log('login error:'.red, iLepra.errorMessage);

                callback(false);
            }else{
                // store cookies
                iLepra.cookies = response.headers['set-cookie'];
                // append cookies to request
                fillRequestWithCookies(iLepra.cookies);

                // process user's data
                processMain(data);

                // dispatch ok
                console.log('login successful!'.green);

                callback(true);
            }
        });
    },

    /***
     Gets last posts from JSON interface
     ***/
    getNewsCounters: function(callback){
        request({url:'http://leprosorium.ru/api/lepropanel'}, function(error, response, data){
            var res = JSON.parse(data);

            iLepra.inboxNewPosts = parseInt(res.inboxunreadposts, 10);
            iLepra.inboxNewComments = parseInt(res.inboxunreadcomms, 10);
            iLepra.karma = parseInt(res.karma, 10);
            iLepra.rating = parseInt(res.rating, 10);
            iLepra.voteweight = parseInt(res.voteweight, 10);
            iLepra.myNewComments = parseInt(res.myunreadcomms, 10);
            iLepra.myNewPosts = parseInt(res.myunreadposts, 10);

            // trigger update
            callback(true);
        });
    },

    /***
     Gets last posts from JSON interface
     ***/
    getLastPosts: function(forceRefresh, callback){
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if posts was loaded earlier than 1 min ago
        if (lastPostFetchTime !== null && Math.abs(time - lastPostFetchTime) < cacheTime && iLepra.latestPosts.length > 0 && !forceRefresh) {
            console.log('posts already loaded!'.yellow);

            // cb
            callback(true);
            return;
        }

        console.log('loading posts...'.yellow);

        // get data
        iLepra.postCount = 0;
        request.post({url: 'http://leprosorium.ru/idxctl/', form:{from:iLepra.postCount}}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            lastPostFetchTime = new Date().getTime();

            // convert string to object
            data = JSON.parse(data);
            // init posts array
            iLepra.latestPosts = [];
            // parse
            iLepra.util.processJSONPosts(data.posts, iLepra.latestPosts, iLepra.config.screenBiggest);
            // trigger cb
            console.log('posts loaded!'.green);

            callback(true);
        });
    },

    /***
     Gets more posts from JSON interface from specified count
     ***/
    getMorePosts: function(callback){
        iLepra.postCount += 42;

        console.log('loading more posts...'.yellow);

        request.post({url: 'http://leprosorium.ru/idxctl/', form:{from:iLepra.postCount}}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading more posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // parse
            iLepra.util.processJSONPosts(data.posts, iLepra.latestPosts, iLepra.config.screenBiggest);
            // trigger callback
            callback(true);
        });
    },

    /***
     Switches posts layout
     0 = mix of main & sub
     1 = only main
     2 = only sub
     ***/
    switchLayout: function(type, callback){
        request.post({url: 'http://leprosorium.ru/threshold/', followAllRedirects:true, form:{
            showonindex: type,
            selected_threshold: 'all'
        }}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error switching layout in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            iLepra.getLastPosts(true, callback);
        });
    },


    /***
     Gets my stuff posts
     ***/
    getMyStuff: function(forceRefresh, callback){
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if there's new posts
        if ((iLepra.myNewComments === myStuffOldNew.c && iLepra.myNewPosts === myStuffOldNew.p) &&
            (myStuffFetchTime !== null && Math.abs(time - myStuffFetchTime) < cacheTime) &&
            iLepra.myStuffPosts.length > 0 && !forceRefresh){
            console.log('mystuff is already loaded:'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading mystuff..:'.yellow);

        // get data
        request({url: 'http://leprosorium.ru/my/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading mystuff in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            myStuffOldNew = {
                p: iLepra.myNewPosts,
                c: iLepra.myNewComments
            };
            myStuffFetchTime = new Date().getTime();

            iLepra.myStuffPosts = [];
            iLepra.util.processHTMLPosts(data, iLepra.myStuffPosts, undefined, iLepra.config.screenBiggest);

            // trigger callback
            console.log('loaded mystuff:'.green);

            callback(true);
        });
    },

    /***
     Gets favourite posts
     ***/
    getFavourites: function(callback){
        // check if posts was loaded earlier
        if (iLepra.favouritePosts !== null && iLepra.favouritePosts.length > 0){
            console.log('favourites already loaded!'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading favourites..:'.yellow);

        // get data
        request({url: 'http://leprosorium.ru/my/favourites/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading favourites in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            iLepra.favouritePosts = [];
            iLepra.util.processHTMLPosts(data, iLepra.favouritePosts, 'fav', iLepra.config.screenBiggest);

            // callback
            console.log('favourites loaded!'.green);

            // dispatch ready and die
            callback(true);
        });
    },

    /***
     Gets inboxes stuff
     ***/
    getInbox: function(forceRefresh, callback){
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if there's new posts
        if ((iLepra.inboxNewComments === inboxOldNew.c && iLepra.inboxNewPosts === inboxOldNew.p) &&
            (inboxFetchTime !== null && Math.abs(time - inboxFetchTime) < cacheTime) &&
            iLepra.inboxPosts.length > 0 && !forceRefresh) {
            console.log('inbox already loaded!'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading inbox..'.yellow);

        // get data
        request({url: 'http://leprosorium.ru/my/inbox/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading favourites in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            inboxOldNew = {
                p: iLepra.inboxNewPosts,
                c: iLepra.inboxNewComments
            };
            inboxFetchTime = new Date().getTime();

            iLepra.inboxPosts = [];
            iLepra.util.processHTMLPosts(data, iLepra.inboxPosts, 'inbox', iLepra.config.screenBiggest);

            console.log('inbox loaded!'.green);

            // dispatch ready and die
            callback(true);
        });
    }
};

/***
 * Chat submodule
 ***/

iLepra.chat = {
    messages: [],
    wtf: null,
    defaultKey: 'leprosorium.ru/',

    getMessages: function(callback){
        var last = getLastId(),
        data = {
            wtf: iLepra.chat.wtf,
            key: iLepra.chat.defaultKey,
            last: last
        };

        console.log('getting chat...'.yellow);

        request.post({url: 'http://leprosorium.ru/chatctl/', form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (iLepra.chat.messages.indexOf(res.messages[i]) === -1)
                    iLepra.chat.messages.push(res.messages[i]);
            }

            console.log('getting chat ok!'.green);

            // dispatch event
            callback(true);
        });
    },

    sendMessage: function(text, callback){
        var last = getLastId(),
        data = {
            wtf: iLepra.chat.wtf,
            key: iLepra.chat.defaultKey,
            last: last,
            body: text
        };

        console.log('posting to chat...'.yellow);

        request.post({url: 'http://leprosorium.ru/chatctl/', form:data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error posting to chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (iLepra.chat.messages.indexOf(res.messages[i]) === -1)
                    iLepra.chat.messages.push(res.messages[i]);
            }

            console.log('posting to chat ok!'.green);

            // dispatch event
            callback(true);
        });
    }
};

/***
 * Government submodule
 ***/

iLepra.gov = {
    president: null,
    time: null,
    ministers: null,
    banned: null,

    getCurrent: function(callback){
        console.log('getting government...'.yellow);

        request({url: 'http://leprosorium.ru/democracy/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error getting government in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            // regex
            var prReg = /<div id="president"><a href=".+?">(.+?)<\/a><p>.+?<br \/>(.+?)<\/p><\/div>/g,
            // get data
            pr = prReg.exec(data);
            iLepra.gov.president = pr[1];
            iLepra.gov.time = pr[2];

            console.log('got government!'.green);

            // dispatch event
            callback(true);
        });
    }
};

/***
 * Post submodule
 ***/

iLepra.post = {
    // current post
    current: null,

    // comments array
    comments: null,
    newComments: null,

    // get post comments
    getComments: function(id, type, domain_url, callback){
        var url, server, voteRes, commentReg, res, text, imgReg, resImg,
            vote, indent, style, isNew, post;

        if (type === 'inbox') {
            url = 'http://leprosorium.ru/my/inbox/'+id;
        } else {
            server = 'leprosorium.ru';
            if (domain_url && domain_url.length > 0) server = domain_url;
            url = 'http://'+server+'/comments/'+id;
        }

        console.log('loading comments...'.yellow);

        request({url:url}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading comments in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            iLepra.post.comments = [];
            iLepra.post.newComments = [];
            iLepra.post.current = {};

            voteRes = /wtf_vote = '(.+?)'/gi.exec(data);
            iLepra.post.current.wtf = {
                comment: /commentsHandler.wtf = '(.+?)'/g.exec(data)[1],
                vote: voteRes !== null ? voteRes[1] : null
            };

            commentReg = /<div id="(.+?)" class="post tree(.+?)"><div class="dt">(.+?)<\/div>.+?<a href=".*?\/users\/.+?">(.+?)<\/a>,(.+?)<span>.+?(<div class="vote".+?><em>(.+?)<\/em><\/span>|<\/div>)(<a href="#".+?class="plus(.*?)">.+?<a href="#".+?class="minus(.*?)">|<\/div>)/g;

            data = data.substr( data.indexOf('id="js-commentsHolder"') );
            res = commentReg.exec(data);

            while(res !== null){
                text = res[3];

                // replace images with compressed ones
                imgReg = /img src="(.+?)"/g;
                resImg = imgReg.exec(text);
                while(resImg !== null){
                    text = text.replace(resImg[1], 'http://src.sencha.io/'+iLepra.config.screenBiggest+'/'+resImg[1]);
                    resImg = imgReg.exec(text);
                }

                vote = 0;
                if(res[9] && res[9].length > 0){
                    vote = 1;
                }else if(res[10] && res[10].length > 0){
                    vote = -1;
                }

                indent = 0;
                resImg = /indent_(.+?) /.exec(res[2]);
                if (resImg !== null) indent = resImg[1];
                if (indent > 15) indent = 15;

                text = text.replace(/<p.*?>/gi, '');
                text = text.replace(/<\/p>/gi, '');
                text = text.replace(/<nonimg/ig, '<img');

                isNew = res[2].indexOf('new') !== -1 ? 1 : 0;

                post = {
                    id: res[1],
                    isNew: isNew,
                    indent: indent,
                    text: text,
                    rating: res[7],
                    user: res[4],
                    when: res[5],
                    vote: vote
                };

                iLepra.post.comments.push(post);
                if(post.isNew) iLepra.post.newComments.push(post);

                res = commentReg.exec(data);
            }

            // dispatch event
            console.log('comments loaded!'.green);

            callback(true);
        });
    },

    // add comment to post
    addComment: function(comment, inReplyTo, wtf, postid, type, domain_url, callback){
        var url, data, i, cm, max;

        url = 'http://';
        if (domain_url && domain_url.length > 0 && type !== 'inbox') {
            url += domain_url;
        } else {
            url += 'leprosorium.ru';
        }
        url += '/commctl/';

        data = {
            wtf: wtf,
            pid: postid,
            comment: comment
        };

        if (inReplyTo) data.replyto = inReplyTo;

        console.log('adding comment...'.yellow);

        request.post({url: url, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error adding comment in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            data = JSON.parse(data);

            if (data.status === 'ERR'){
                console.log('lepra thrown an error while adding comment!'.red, data);

                callback(false);
            } else {
                if(!inReplyTo){
                    iLepra.post.comments.push({
                        id: data.new_comment.comment_id,
                        isNew: 1,
                        indent: 0,
                        text: comment,
                        rating: 0,
                        user: data.new_comment.user_login,
                        when: data.new_comment.date + ' в ' + data.new_comment.time,
                        vote: 0
                    });
                }else{
                    max = iLepra.post.comments.length;
                    for(i = 0; i < max; i++){
                        cm = iLepra.post.comments[i];
                        if(cm.id === data.new_comment.replyto_id){
                            iLepra.post.comments.splice(i+1, 0, {
                                id: data.new_comment.comment_id,
                                isNew: 1,
                                indent: (parseInt(cm.indent, 10)+1).toString(),
                                text: comment,
                                rating: 0,
                                user: data.new_comment.user_login,
                                when: data.new_comment.date + ' в ' + data.new_comment.time,
                                vote: 0
                            });
                            break;
                        }
                    }
                }

                console.log('adding comment ok!'.green);

                callback(true);
            }
        });
    },

    // vote for comment
    voteComment: function(value, id, postid, wtf, domain_url, callback){
        var url, data;

        url = 'http://';
        if (domain_url && domain_url.length > 0) {
            url += domain_url;
        } else {
            url += 'leprosorium.ru';
        }
        url += '/rate/';

        data = {
            type: 0,
            wtf: wtf,
            post_id: postid,
            id: id,
            value: value // 1 || -1
        };

        console.log('voting...'.yellow);

        // post
        request.post({url: url, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error voting in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('voting oK!:'.green);

            callback(true);
        });
    },

    // vote for post
    votePost: function(value, id, domain_url, callback){
        var url, data;

        url = 'http://';
        if (domain_url && domain_url.length > 0){
            url += domain_url;
        } else {
            url += 'leprosorium.ru';
        }
        url += '/rate/';

        data = {
            type: 1,
            wtf: iLepra.postVoteWTF,
            id: id,
            value: value // 1 || -1
        };

        console.log('voting for post...'.yellow);

        // post
        // post
        request.post({url: url, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error voting for post in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('voting oK!:'.green);

            callback(true);
        });
    }
};


/***
 * Profile submodule
 ***/

iLepra.profile = {
    data: null,

    getProfile: function(username, callback){
        var url, userpic, regdata, num, date, name, loc, karma,
            statWrote, statRate, userstat, votestat, story, contacts;

        url = 'http://leprosorium.ru/users/'+username;

        console.log('getting profile for :'.yellow, username.yellow);

        request({url:url}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error getting profile in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            userpic = /<table class="userpic"><tbody><tr><td><img src="(.+?)".+?\/>/g.exec(data);
            if( userpic ){
                userpic = userpic[1];
            }else{
                userpic = '';
            }

            regdata = /<div class="userregisterdate">(.+?)<\/div>/g.exec(data)[1].replace(/\./g, '').split(', ');
            num = regdata[0];
            date = regdata[1];

            name = /<div class="userbasicinfo"><h3>(.+?)<\/h3>/g.exec(data)[1];
            loc = /<div class="userego">(.+?)<\/div>/g.exec(data)[1];
            karma = /<span class="rating" id="js-user_karma".+?><em>(.+?)<\/em>/g.exec(data)[1];

            statWrote = /<div class="userstat userrating">(.+?)<\/div>/g.exec(data);
            statRate = /<div class="userstat uservoterate">Вес голоса&nbsp;&#8212; (.+?)<br.*?>Голосов в день&nbsp;&#8212; (.+?)<\/div>/g.exec(data);
            userstat = statWrote[1].replace(/(<([^>]+)>)/ig, ' ');
            votestat = 'Вес голоса&nbsp;&#8212; '+statRate[1]+',<br>Голосов в день&nbsp;&#8212; '+statRate[2];

            story = /<div class="userstory">(.+?)<\/div>/g.exec(data);
            if (story !== null) {
                story = story[1];
            } else {
                story = '';
            }

            contacts = /<div class="usercontacts">(.+?)<\/div>/g.exec(data)[1].split(/<br.*?>/);

            iLepra.profile.data = {
                username: username,
                userpic: userpic,
                number: num,
                regDate: date,
                fullName: name,
                location: loc,
                karma: karma,
                userstat: userstat,
                votestat: votestat,
                contacts: contacts,
                description: story
            };

            console.log('got profile!'.green);

            // dispatch event
            callback(true);
        });
    }
};

/***
 * Subs submodule
 ***/

iLepra.sub = {
    list: null,
    posts: null,
    fetch: true,
    postCount: 0,

    getList: function(callback){
        console.log('getting sublepras...'.yellow);

        request({url:'http://leprosorium.ru/underground/readers/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error getting sublepras in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            iLepra.sub.list = [];

            var subReg, res, name, sublepra;

            subReg = /<strong class="jj_logo"><a href="(.+?)"><img src="(.+?)" alt="(.*?)" \/>.+?<a href=".*?\/users\/.+?">(.+?)<\/a>/g;
            res = subReg.exec(data);

            while(res !== null){
                name = res[3] ? res[3] : res[1];

                sublepra = {
                    name: name,
                    creator: res[4],
                    link: res[1],
                    logo: res[2]
                };
                iLepra.sub.list.push(sublepra);

                res = subReg.exec(data);
            }

            // dispatch event
            console.log('got sublepras!'.green);

            callback(true);
        });
    },

    getPosts: function(url, callback){
        // get data
        iLepra.sub.postCount = 0;

        console.log('getting sublepra posts...'.yellow);

        request.post({url: url+'/idxctl/', from:iLepra.sub.postCount}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error getting sublepra posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // init posts array
            iLepra.sub.posts = [];
            // parse
            iLepra.util.processJSONPosts(data.posts, iLepra.sub.posts);

            console.log('got sublepra posts!'.green);

            // trigger event
            callback(true);
        });
    },

    getMorePosts: function(url, callback){
        iLepra.sub.postCount += 42;

        console.log('getting more sublepra posts...'.yellow);

        request.post({url: url+'/idxctl/', from:iLepra.sub.postCount}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error getting sublepra more posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // parse
            iLepra.util.processJSONPosts(data.posts, iLepra.sub.posts);

            console.log('got sublepra more posts!'.green);

            // trigger event
            callback(true);
        });
    }
};

// export
module.exports = iLepra;
