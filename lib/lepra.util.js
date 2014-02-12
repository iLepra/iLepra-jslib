module.exports = function(self) {
    /**
     * Utility object initializer
     * @return {Object} utility object
     */
    var utilInit = function() {
        return this;
    };

    /**
     * Processes given HTML object for latest posts and pushes them to given array
     * @param  {String} data          html string to process
     * @param  {Array}  postArray     array to fill with processed posts
     * @param  {String} type          type of posts
     * @param  {String} screenBiggest screen size placeholder string
     * @return {undefined}
     */
    utilInit.prototype.processHTMLPosts = function(data, postArray, type, screenBiggest){
        screenBiggest = screenBiggest || '%screen%';

        // cleanup data
        data = data.replace(/\n+/g, '');
        data = data.replace(/\r+/g, '');
        data = data.replace(/\t+/g, '');

        var postReg, res, body, imgReg, resImg, img,
            text, userSub, vote, sub, post;

        postReg =/<div class="post.+?id="(.+?)".+?class="dt">(.+?)<\/div>.+?<a href=".*?\/users\/.+?".*?>(.+?)<\/a>,(.+?)<span>.+?<a href=".*?\/(comments|inbox)\/.+?">(.+?)<\/span>.+?.+?(<div class="vote".+?><em>(.+?)<\/em><\/span>|<\/div>)(<a href="#".+?class="plus(.*?)">.+?<a href="#".+?class="minus(.*?)">|<\/div>)/g;
        res = postReg.exec(data);

        while(res !== null){
            body = res[2];

            imgReg = /img src="(.+?)"/g;
            resImg = imgReg.exec(body);
            img = '';
            if (resImg !== null) {
                img = resImg[1];
            }

            text = body.replace(/(<([^>]+)>)/ig,' ').substr(0, 140);
            if(text.length === 140) text += '..';

            userSub = res[3].split('</a> в ');
            sub = userSub[1] ? userSub[1].replace(/(<([^>]+)>)/ig, '') : '' ;

            vote = 0;
            if(res[9] !== null && res[9].length > 0){
                vote = 1;
            }else if(res[10] !== null && res[10].length > 0){
                vote = -1;
            }

            post = {
                id: res[1].replace('p', ''),
                body: body,
                rating: res[8],
                user: userSub[0],
                domain_url: sub,
                when: res[4],
                comments: res[6].replace(/(<([^>]+)>)/ig, '').replace(/коммента.+?(\s|$)/g, '').replace(/ нов.+/g, ''),
                image: img,
                text: text,
                type: type,
                vote: vote
            };


            postArray.push(post);

            res = postReg.exec(data);
        }
    };

    /**
     * Processes given JSON object for latest posts
     * @param  {Object}  posts         array of posts in JSON format from leprosorium
     * @param  {Array}   postArray     array to be filled with posts
     * @param  {String}  screenBiggest screen size placeholder string
     * @return {undefined}
     */
    utilInit.prototype.processJSONPosts = function(posts, postArray, screenBiggest){
        var i, post, imgReg, res, img, text;

        screenBiggest = screenBiggest || '%screen%';

        for(i in posts){
            post = {};

            // get img and short text
            imgReg = /img src="(.+?)"/gi;
            res = imgReg.exec(posts[i].body);
            img = '';
            if (res !== null) {
                // save first image as post image
                img = res[1];
            }

            text = posts[i].body.replace(/(<([^>]+)>)/g,' ').substr(0, 140);
            if (text.length === 140) text += '..';

            post.id = posts[i].id;
            post.body = posts[i].body;
            post.rating = posts[i].rating;
            post.domain_url = posts[i].domain_url;
            post.image = img;
            post.text = text;
            post.user = posts[i].login;
            post.comments = posts[i].comm_count + ' / ' + posts[i].unread;
            post.wrote = (posts[i].gender === 1 ? 'Написал ' : 'Написала ') + posts[i].user_rank + ' ' +posts[i].login;
            post.when = posts[i].textdate + ' в ' + posts[i].posttime;
            post.vote = parseInt(posts[i].user_vote, 10);

            if (postArray.indexOf(post) === -1) {
                postArray.push(post);
            }
        }
    };

    return new utilInit();
};
