Sync cookie for local dev
------------

For example, you're developing locally and serve from `http://ns.mywebsite.com:3000`.

But your login session and cookie are written to host `https://mywebsite.com`.

This extension saves the extra work of having to mannually disable `httpOnly`
and `secure` tags for the cookies written so that you can use them locally.

###### basic implementation details

- get cookies:`chrome.cookies.get`
- set cookies:`chrome.cookies.set`
