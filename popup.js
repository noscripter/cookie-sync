/**
 * 获取当前tab
 * @param  {function}  cb  [回调函数]
 */
async function getCurrentTab() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true
        },
        (tabs) => {
          resolve(tabs)
        }
      )
    } catch (error) {
      reject(error)
    }
  })
}

let targetHref = '';

/**
 * 设置cookie
 * @param  {string}  url   [需要设置的 Cookie 相关联的 URL]
 * @param  {object}  opt  [额外参数]
 */
function setCookie(url, opt) {
  return new Promise(function(resolve, reject) {
    //console.log('debugging setCookie url', url);
    console.log('debugging setCookie opt', opt);
    console.log('debugging setCookie opt.domain', opt.domain);
    // set current url's cookie
    chrome.cookies.set(
      {
        url,
        name: opt.name,
        value: opt.value,
        secure: false,
        httpOnly: false,
      },
      function(cookie) {
        if (cookie) {
          resolve(cookie)
        } else {
          reject(false)
        }
      }
    );
    // set cookie for source domain
    chrome.cookies.set(
      {
        domain: opt.domain,
        url,
        name: opt.name,
        value: opt.value,
        secure: false,
        httpOnly: false,
      },
      function(cookie) {
        if (cookie) {
          resolve(cookie)
        } else {
          reject(false)
        }
      }
    );
  })
}

/**
 * 获取所有cookie
 * @param  {string}  url  [需要获取的 Cookie 相关联的 URL]
 * @param  {object}  opt  [额外参数]
 */
function getAllCookie(url, opt) {
  return new Promise(function(resolve) {
    chrome.cookies.getAll(
      {
        domain: getWebDomain(url),
        ...opt
      },
      function(cookie) {
        console.log('debugging getAllCookie url', url);
        console.log('debugging getAllCookie opt', opt);
        console.log('debugging getAllCookie cookie', cookie);
        if (cookie) {
          resolve(cookie)
        } else {
          resolve(null)
        }
      }
    )
  })
}

function showMsg({
  message,
  type
}) {
  const msgEl = document.querySelector('#msg');
  let color;
  switch (type) {
    case 'error': {
      color = '#CC3000';
      break;
    }
    case 'info': {
      color = '#FFF';
      break;
    }
    default: {
      color = '#EEE';
      break;
    }
  }
  msgEl.innerHTML = `<p style="color: ${color}; font-weight: bolder; font-size: 1.2rem; width: 100%;">${message}</p>`
}

const VALID_URL = /^(https?:\/\/)?[^/]+[:\d+]?[\/]?/;
const DEFAULT_TARGET_URL = 'http://localhost:3333';

async function getCookie(sourceUrl) {
  const cookie = await getAllCookie(sourceUrl);
  showMsg({
    message: `<textarea style="min-height: 200px; background: #000; color: limegreen; font-size:0.75rem; width:100%; border-radius: 5px; border: none;">${JSON.stringify(cookie, null, '  ')}</textarea>`,
    type: 'info',
  });
  return cookie;
}

async function syncCookie(sourceEl, targetEl) {
  try {
    const sourceUrl = sourceEl.value;
    let targetUrl = targetEl.value.trim();
    if (targetUrl === "") {
      targetEl.value = DEFAULT_TARGET_URL;
    }
    if (!VALID_URL.test(sourceUrl)) {
      showMsg({
        message: `sourceUrl invalid`,
        type: 'error',
      });
    } else if (!VALID_URL.test(targetUrl)) {
      showMsg({
        message: `targetUrl invalid`,
        type: 'error',
      });
    } else {
      const cookie = await getCookie(sourceUrl);
      if (cookie && cookie.length) {
        const allCookie = cookie.map((item) => {
          setCookie(targetUrl, {
            domain: getWebDomain(targetUrl),
            name: item.name,
            value: item.value,
            path: item.path,
            expirationDate: item.expirationDate
          })
        })
        try {
          await Promise.all(allCookie);
          showMsg({
            message: `sync from ${sourceUrl} to ${targetUrl} success`
          });
          chrome.tabs.update({ url: targetHref }); // {{ edit_1 }}
        } catch (e) {
          showMsg({
            message: `sync from ${sourceUrl} to ${targetUrl} failed with error: ${e?.message}`,
            type: 'error'
          })
        }
      } else {
        showMsg({
          message: 'cookie empty',
          type: 'error'
        })
      }
    }
  } catch (e) {
    showMsg({ message: e.message, type: 'error' });
  }
}

/**
 * 获取网站以点开头的Domain
 * @param  {string}  url [网站地址]
 */
function getWebDomain(url) {
  const hostname = new URL(url).hostname.split('.').slice(-2).join('.');
  console.log('debugging getWebDomainHostname', hostname);
  return hostname;
}

window.onload = function() {
  const sourceEl = document.querySelector('#source');
  const targetEl = document.querySelector('#target');
  const syncButton = document.querySelector('#sync');
  const syncCurrentButton = document.querySelector('#syncCurrent');
  const showCookieButton = document.querySelector('#showCookie');

  syncButton.addEventListener('click', async () => {
    await syncCookie(sourceEl, targetEl);
  });

  syncCurrentButton.addEventListener('click', async () => {
    const tabs = await getCurrentTab();
    const sourceUrl = tabs[0].url;
    sourceEl.value = sourceUrl;

    const regex = /[?&]redirect=([^&]+)/;
    const match = sourceUrl.match(regex);

    if (match) {
      const decodedRedirectUrl = decodeURIComponent(match[1]);
      const temp = new URL(decodedRedirectUrl);
      // const redirectOrigin = temp.origin;
      targetEl.value = temp.origin;
      targetHref = temp.href;
    }
  });

  showCookieButton.addEventListener('click', async () => {
    const sourceUrl = sourceEl.value;
    await getCookie(sourceUrl);
  });
}

