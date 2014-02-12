

<!-- Start lib/lepra.core.js -->

## init(cookies, callback)

Initializes iLepra for work,
checks if given cookies are valid
and user is logged in,
gets captcha if not and posts if yes

### Params: 

* **Array** *cookies* array of cookies to use for requests

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## tryLogin(data, callback)

Tries logging in with given user data

### Params: 

* **Object** *data* user data (i.e. login, pass, etc)

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getNewsCounters(callback)

Gets last posts from leprosorium JSON interface

### Params: 

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getLastPosts(forceRefresh, callback)

Gets last posts from leprosorium JSON interface

### Params: 

* **Boolean** *forceRefresh* whether posts should be fetched no mater when they was cached

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getMorePosts(callback)

Gets more posts from leprosorium JSON interface starting from specified post count

### Params: 

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## switchLayout(type, callback)

Switches posts layout for main page

### Params: 

* **Number** *type* layout to be used (0 = mix of main &amp; sub, 1 = only main, 2 = only sub)

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getMyStuff(forceRefresh, callback)

Gets my stuff posts from leprosorium

### Params: 

* **Boolean** *forceRefresh* whether posts should be fetched no mater when they was cached

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getFavourites(callback)

Gets favourite posts from leprosorium

### Params: 

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## getInbox(forceRefresh, callback)

Gets inbox posts from leprosorium

### Params: 

* **Boolean** *forceRefresh* whether posts should be fetched no mater when they was cached

* **Function** *callback* executed upon completition with Boolean indicating status

### Return:

* **undefined** 

## processCaptcha(source)

Processes given html string for captcha data

### Params: 

* **String** *source* html to be processed

### Return:

* **undefined** 

## processMain(data)

Processes given html string for user&#39;s data

### Params: 

* **String** *data* html to be processed

### Return:

* **undefined** 

## getLastId()

Gets last chat message ID

### Return:

* **String** last chat message ID

<!-- End lib/lepra.core.js -->

