var should = require('should');
var lepralib = require('../lepra');

// cookies - put your cookies here
var cookies = [];

describe('lepralib', function() {
    /**
     * Main functions tests
     */
    describe('#init()', function() {
        it('should get captcha and login code', function(done){
            lepralib.init(null, function(success){
                if (!lepralib.isAuthenticated) {
                    success.should.be.false;
                    lepralib.captchaURL.should.be.a('string');
                    lepralib.loginCode.should.be.a('string');
                    done();
                }else{
                    success.should.be.true;
                    lepralib.userSubLepras.should.not.be.empty;
                    lepralib.userSubLepras[0].should.have.property('name');
                    lepralib.userSubLepras[0].should.have.property('creator');
                    lepralib.userSubLepras[0].should.have.property('link');
                    lepralib.userSubLepras[0].should.have.property('logo');
                    done();
                }
            });
        });

        it('should get user sublepras', function(done){
            lepralib.init(cookies, function(success){
                if (!lepralib.isAuthenticated) {
                    success.should.be.false;
                    lepralib.captchaURL.should.be.a('string');
                    lepralib.loginCode.should.be.a('string');
                    done();
                }else{
                    success.should.be.true;
                    lepralib.userSubLepras.should.not.be.empty;
                    lepralib.userSubLepras[0].should.have.property('name');
                    lepralib.userSubLepras[0].should.have.property('creator');
                    lepralib.userSubLepras[0].should.have.property('link');
                    lepralib.userSubLepras[0].should.have.property('logo');
                    done();
                }
            });
        });
    });

    describe('#getLastPosts()', function(){
        it('should get new posts', function(done) {
            lepralib.getLastPosts(true, function(success){
                success.should.be.true;
                lepralib.latestPosts.should.not.be.empty;
                lepralib.latestPosts.should.have.length(42);
                lepralib.latestPosts[0].should.have.property('id');
                lepralib.latestPosts[0].should.have.property('body');
                lepralib.latestPosts[0].should.have.property('rating');
                lepralib.latestPosts[0].should.have.property('domain_url');
                lepralib.latestPosts[0].should.have.property('image');
                lepralib.latestPosts[0].should.have.property('text');
                lepralib.latestPosts[0].should.have.property('user');
                lepralib.latestPosts[0].should.have.property('comments');
                lepralib.latestPosts[0].should.have.property('wrote');
                lepralib.latestPosts[0].should.have.property('when');
                lepralib.latestPosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#getMorePosts()', function(){
        it('should get more posts', function(done) {
            var postCount = lepralib.latestPosts ? lepralib.latestPosts.length : 0;

            lepralib.getMorePosts(function(success){
                success.should.be.true;
                lepralib.latestPosts.should.not.be.empty;
                (lepralib.latestPosts.length - postCount).should.equal(42);
                lepralib.latestPosts[0].should.have.property('id');
                lepralib.latestPosts[0].should.have.property('body');
                lepralib.latestPosts[0].should.have.property('rating');
                lepralib.latestPosts[0].should.have.property('domain_url');
                lepralib.latestPosts[0].should.have.property('image');
                lepralib.latestPosts[0].should.have.property('text');
                lepralib.latestPosts[0].should.have.property('user');
                lepralib.latestPosts[0].should.have.property('comments');
                lepralib.latestPosts[0].should.have.property('wrote');
                lepralib.latestPosts[0].should.have.property('when');
                lepralib.latestPosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#switchLayout()', function(){
        it('should switch layout', function(done) {
            lepralib.switchLayout(0, function(success){
                success.should.be.true;
                lepralib.latestPosts.length.should.equal(42);
                lepralib.latestPosts[0].should.have.property('id');
                lepralib.latestPosts[0].should.have.property('body');
                lepralib.latestPosts[0].should.have.property('rating');
                lepralib.latestPosts[0].should.have.property('domain_url');
                lepralib.latestPosts[0].should.have.property('image');
                lepralib.latestPosts[0].should.have.property('text');
                lepralib.latestPosts[0].should.have.property('user');
                lepralib.latestPosts[0].should.have.property('comments');
                lepralib.latestPosts[0].should.have.property('wrote');
                lepralib.latestPosts[0].should.have.property('when');
                lepralib.latestPosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#getMyStuff()', function(){
        it('should get mystuff', function(done) {
            lepralib.getMyStuff(true, function(success){
                success.should.be.true;
                lepralib.myStuffPosts.should.not.be.empty;
                lepralib.myStuffPosts[0].should.have.property('id');
                lepralib.myStuffPosts[0].should.have.property('body');
                lepralib.myStuffPosts[0].should.have.property('rating');
                lepralib.myStuffPosts[0].should.have.property('domain_url');
                lepralib.myStuffPosts[0].should.have.property('image');
                lepralib.myStuffPosts[0].should.have.property('text');
                lepralib.myStuffPosts[0].should.have.property('user');
                lepralib.myStuffPosts[0].should.have.property('comments');
                lepralib.myStuffPosts[0].should.have.property('when');
                lepralib.myStuffPosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#getFavourites()', function(){
        it('should get favourites', function(done) {
            lepralib.getFavourites(function(success){
                success.should.be.true;
                lepralib.favouritePosts.should.not.be.empty;
                lepralib.favouritePosts[0].should.have.property('id');
                lepralib.favouritePosts[0].should.have.property('body');
                lepralib.favouritePosts[0].should.have.property('rating');
                lepralib.favouritePosts[0].should.have.property('domain_url');
                lepralib.favouritePosts[0].should.have.property('image');
                lepralib.favouritePosts[0].should.have.property('text');
                lepralib.favouritePosts[0].should.have.property('user');
                lepralib.favouritePosts[0].should.have.property('comments');
                lepralib.favouritePosts[0].should.have.property('when');
                lepralib.favouritePosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#getInbox()', function(){
        it('lepralib should get inbox', function(done) {
            lepralib.getInbox(true, function(success){
                success.should.be.true;
                lepralib.inboxPosts.should.not.be.empty;
                lepralib.inboxPosts[0].should.have.property('id');
                lepralib.inboxPosts[0].should.have.property('body');
                lepralib.inboxPosts[0].should.have.property('rating');
                lepralib.inboxPosts[0].should.have.property('domain_url');
                lepralib.inboxPosts[0].should.have.property('image');
                lepralib.inboxPosts[0].should.have.property('text');
                lepralib.inboxPosts[0].should.have.property('user');
                lepralib.inboxPosts[0].should.have.property('comments');
                lepralib.inboxPosts[0].should.have.property('when');
                lepralib.inboxPosts[0].should.have.property('vote');
                done();
            });
        });
    });

    describe('#doLogout()', function(){
        // remove skip to test logout.
        // warning! this will remove cookies & will require re-auth through cli-client
        it.skip('should logout', function(done) {
            lepralib.doLogout(function(success){
                success.should.be.true;
                lepralib.init(function(success){
                    success.should.be.false;
                    lepralib.captchaURL.should.be.a('string');
                    lepralib.loginCode.should.be.a('string');
                    done();
                });
            });
        });
    });

    /**
     * Chat submodule tests
     */
    describe('.chat', function(){
        describe('#getMessages()', function(){
            it('should get chat messages', function(done) {
                lepralib.chat.getMessages(function(success){
                    success.should.be.true;
                    lepralib.chat.messages.length.should.equal(42);
                    lepralib.chat.messages[0].should.have.property('id_user');
                    lepralib.chat.messages[0].should.have.property('body');
                    lepralib.chat.messages[0].should.have.property('createdate');
                    lepralib.chat.messages[0].should.have.property('id');
                    lepralib.chat.messages[0].should.have.property('user_login');
                    done();
                });
            });
        });

        describe('#sendMessage()', function(){
            it.skip('should send chat messages', function(done) {
                lepralib.chat.sendMessage('Тестовый привет от робота, котаны!', function(success){
                    success.should.be.true;
                    done();
                });
            });
        });
    });

    /**
     * Government submodule tests
     */
    describe('.gov', function(){
        describe('#getCurrent()', function(){
            it('should get current government', function(done){
                lepralib.gov.getCurrent(function(success){
                    success.should.be.true;
                    lepralib.gov.president.should.not.be.empty;
                    lepralib.gov.time.should.not.be.empty;
                    done();
                });
            });
        });
    });

    /**
     * Post submodule tests
     */
    describe('.post', function(){
        describe('#getComments()', function(){
            it('should get post comments', function(done){
                lepralib.post.getComments('1530936', '', 'games.leprosorium.ru', function(success){
                    success.should.be.true;
                    lepralib.post.current.should.have.property('wtf');
                    lepralib.post.current.wtf.should.have.property('comment');
                    lepralib.post.current.wtf.should.have.property('vote');
                    should.exist(lepralib.post.comments);
                    done();
                });
            });
        });

        describe.skip('#addComment()', function(){
            it('should post comment', function(done){
                var comLen = lepralib.post.comments.length;
                lepralib.post.addComment('test post '+new Date().toString(), null, lepralib.post.current.wtf.comment, '1539365', 'inbox', null, function(success){
                    success.should.be.true;
                    (lepralib.post.comments.length - comLen).should.equal(1);
                    done();
                });
            });
        });

        describe.skip('#voteComment()', function(){
            it('should vote for comment', function(done){
                lepralib.post.voteComment('1', '33981295', '1530936', lepralib.post.current.wtf.vote, 'games.leprosorium.ru', function(success){
                    success.should.be.true;
                    done();
                });
            });
        });

        describe.skip('#votePost()', function(){
            it('should vote for post', function(done){
                lepralib.post.votePost('1', '1530936', 'games.leprosorium.ru', function(success){
                    success.should.be.true;
                    done();
                });
            });
        });
    });

    /**
     * Profile submodule tests
     */
    describe('.profile', function(){
        describe('#getProfile()', function(){
            it('should get profile', function(done){
                lepralib.profile.getProfile('yamalight', function(success){
                    success.should.be.true;
                    lepralib.profile.data.username.should.equal('yamalight');
                    done();
                });
            });
        });
    });

    /**
     * Subs submodule tests
     */
    describe('.sub', function(){
        describe('#getList()', function(){
            it('should get list of sublepras', function(done){
                lepralib.sub.getList(function(success){
                    success.should.be.true;
                    lepralib.sub.list.length.should.equal(42);
                    lepralib.sub.list[0].should.have.property('name');
                    lepralib.sub.list[0].should.have.property('creator');
                    lepralib.sub.list[0].should.have.property('link');
                    lepralib.sub.list[0].should.have.property('logo');
                    done();
                });
            });
        });

        describe('#getPosts()', function(){
            it('should get sublepra posts', function(done){
                lepralib.sub.getPosts('http://kote.leprosorium.ru/', function(success){
                    success.should.be.true;
                    lepralib.sub.posts.length.should.equal(42);
                    lepralib.sub.posts[0].should.have.property('id');
                    lepralib.sub.posts[0].should.have.property('body');
                    lepralib.sub.posts[0].should.have.property('rating');
                    lepralib.sub.posts[0].should.have.property('domain_url');
                    lepralib.sub.posts[0].should.have.property('image');
                    lepralib.sub.posts[0].should.have.property('text');
                    lepralib.sub.posts[0].should.have.property('user');
                    lepralib.sub.posts[0].should.have.property('comments');
                    lepralib.sub.posts[0].should.have.property('wrote');
                    lepralib.sub.posts[0].should.have.property('when');
                    lepralib.sub.posts[0].should.have.property('vote');
                    done();
                });
            });
        });

        describe('#getMorePosts()', function(){
            it('should get more posts', function(done){
                var oldCount = lepralib.sub.postCount;
                lepralib.sub.getMorePosts('http://kote.leprosorium.ru/', function(success){
                    success.should.be.true;
                    (lepralib.sub.postCount - oldCount).should.equal(42);
                    lepralib.sub.posts[0].should.have.property('id');
                    lepralib.sub.posts[0].should.have.property('body');
                    lepralib.sub.posts[0].should.have.property('rating');
                    lepralib.sub.posts[0].should.have.property('domain_url');
                    lepralib.sub.posts[0].should.have.property('image');
                    lepralib.sub.posts[0].should.have.property('text');
                    lepralib.sub.posts[0].should.have.property('user');
                    lepralib.sub.posts[0].should.have.property('comments');
                    lepralib.sub.posts[0].should.have.property('wrote');
                    lepralib.sub.posts[0].should.have.property('when');
                    lepralib.sub.posts[0].should.have.property('vote');
                    done();
                });
            });
        })
    });

});













