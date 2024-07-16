Sync cookie for local dev
------------

###### NOTE!

> you need to disable `block third-party cookies` to make this work.

specific customization steps:

- firefox:
  - almost the same as in chrome.
- chrome:
  - open `chrome:settings` in location bar
  - navigate to `Privacy and security` on the left menu
  - click `Third-party cookies`
  - enable `Block third-party cookies` by default
  - in `sites allowed to use third-party cookies` area, click the `Add` button
  - input `localhost`

In summary, block 3rd party cookies should be disabled in `localhost`.

###### description

For example, you're developing locally and serve from `http://ns.mywebsite.com:3000`.

But your login session and cookie are written to host `https://mywebsite.com`.

This extension saves the extra work of having to mannually disable `httpOnly`
and `secure` tags for the cookies written so that you can use them locally.

###### basic implementation details

- get cookies:`chrome.cookies.get`
- set cookies:`chrome.cookies.set`
