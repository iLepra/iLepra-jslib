module.exports = function(self) {
    var postInit = function () {
        // current post
        this.current = null;

        // comments array
        this.comments = null;
        this.newComments = null;

        return this;
    };

    // get post comments
    postInit.prototype.getComments = function(id, type, domain_url, callback) {
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

        self.request({url:url}, function(error, response, data){
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

            self.post.comments = [];
            self.post.newComments = [];
            self.post.current = {};

            voteRes = /wtf_vote = '(.+?)'/gi.exec(data);
            self.post.current.wtf = {
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
                    text = text.replace(resImg[1], 'http://src.sencha.io/'+self.config.screenBiggest+'/'+resImg[1]);
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

                self.post.comments.push(post);
                if(post.isNew) self.post.newComments.push(post);

                res = commentReg.exec(data);
            }

            // dispatch event
            console.log('comments loaded!'.green);

            callback(true);
        });
    };

    // add comment to post
    postInit.prototype.addComment = function(comment, inReplyTo, wtf, postid, type, domain_url, callback) {
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

        self.request.post({url: url, form: data}, function(error, response, data){
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
                    self.post.comments.push({
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
                    max = self.post.comments.length;
                    for(i = 0; i < max; i++){
                        cm = self.post.comments[i];
                        if(cm.id === data.new_comment.replyto_id){
                            self.post.comments.splice(i+1, 0, {
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
    };

    // vote for comment
    postInit.prototype.voteComment = function(value, id, postid, wtf, domain_url, callback) {
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
        self.request.post({url: url, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error voting in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('voting oK!:'.green);

            callback(true);
        });
    };

    // vote for post
    postInit.prototype.votePost = function(value, id, domain_url, callback) {
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
            wtf: self.postVoteWTF,
            id: id,
            value: value // 1 || -1
        };

        console.log('voting for post...'.yellow);

        // post
        // post
        self.request.post({url: url, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error voting for post in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('voting oK!:'.green);

            callback(true);
        });
    };

    return new postInit();
};