

<!-- Start lepra.js -->

## log()

Custom logging function
Only outputs if config.debug is true

## fillRequestWithCookies(cookies)

Replaces class instance of request.js
with new one that is filled with given cookies

### Params: 

* **Array** *cookies* array of cookies to use

## request

Local instance of request.js

## cacheTime

Maximum caching time after which
data should be re-fetched from server

## lastPostFetchTime

Time when latest posts was fetched

## myStuffFetchTime

Time when user&#39;s &quot;my stuff&quot; posts was fetched

## inboxFetchTime

Time when user&#39;s inbox posts was fetched

## myStuffOldNew

Object that contains count of new posts and comments in my stuff

## inboxOldNew

Object that contains count of new posts and comments in inbox

## config

Library config

If library should run in debug mode

Biggest side of screen template.
Can be replaced on client with Number
to resize image by max side

## isAuthenticated

Whether user is authenticated

## loginCode

Login code for current captcha image

## captchaURL

URL for current captcha image

## cookies

Current user cookies

## errorMessage

Current extended error message

## username

Current user username

## userSubLepras

Current user list of sublepras

## inboxNewPosts

Count of new posts in inbox

## inboxNewComments

Count of new comments in inbox

## karma

User karma

## rating

User rating

## voteweight

User vote weight

## myNewComments

Count of new comments in my stuff

## myNewPosts

Count of new posts in my stuff

## latestPosts

Fetched latest posts

## postCount

Count of currently fetched posts

## postVoteWTF

Current post WTF id

## myStuffPosts

Fetched posts from my stuff

## myStuffWTF

My stuff WTF id

## favouritePosts

Fetched favourite posts

## inboxPosts

Fetched inbox posts

## logoutWTF

WTF id used for logout

* Core submodule

## util

Utility submodule

## chat

Chat submodule

## gov

Government submodule

## post

Posts submodule

## profile

Profile submodule

## sub

Sublepras submodule

<!-- End lepra.js -->

