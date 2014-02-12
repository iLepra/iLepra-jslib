

<!-- Start lib/lepra.post.js -->

## postInit()

Post object initializer

### Return:

* **Object** post object

## current

Current post description

## comments

Comments for current post

## newComments

New comments for current post

## getComments(id, type, domain_url, callback)

Get current post comments

### Params: 

* **String** *id* post id

* **String** *type* post type

* **String** *domain_url* domain url for the main lepra / sub lepra for post

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## addComment(comment, inReplyTo, wtf, postid, type, domain_url, callback)

Add comment to current post

### Params: 

* **String** *comment* text of the comment to be added

* **String** *inReplyTo* reply to id of the comment

* **String** *wtf* WTF id used for posting comments to current post

* **String** *postid* post id

* **String** *type* post type

* **String** *domain_url* domain url for the main lepra / sub lepra for post

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## voteComment(value, id, postid, wtf, domain_url, callback)

Vote for given comment

### Params: 

* **String** *value* upvote (1) or downvote (-1)

* **String** *id* comment it

* **String** *postid* post id

* **String** *wtf* WTF id used for voting

* **String** *domain_url* domain url for the main lepra / sub lepra for post

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## votePost(value, id, domain_url, callback)

Vote for given post

### Params: 

* **String** *value* upvote (1) or downvote (-1)

* **String** *id* post id

* **String** *domain_url* domain url for the main lepra / sub lepra for post

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

<!-- End lib/lepra.post.js -->

