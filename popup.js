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

/**
 * 格式化网址为最简单的符合权限的格式
 * @param  {string}  url [网站地址]
 */
function getFormatUrl(url) {
  if (!url.includes('http:') && !url.includes('https:')) {
    url = 'http://' + url
  }
  const formatUrl = new URL(url)
  return `${formatUrl.protocol}//${formatUrl.host}/`
}

/**
 * 查看权限
 * @param  {string}  url  [需要请求相关权限的目标URL]
 * @param  {array}   otherPermission  [额外权限参数]
 */
function permissionsContains(url) {
  return new Promise(resolve => {
    chrome.permissions.contains(
      {
        permissions: ['cookies'],
        origins: [url]
      },
      function(res) {
        resolve(res)
      }
    )
  })
}

/**
 * 设置cookie
 * @param  {string}  url   [需要设置的 Cookie 相关联的 URL]
 * @param  {object}  opt  [额外参数]
 */
function setCookie(url, opt) {
  return new Promise(function(resolve, reject) {
    chrome.cookies.set(
      {
        url,
        ...opt
      },
      function(cookie) {
        if (cookie) {
          resolve(cookie)
        } else {
          reject(false)
        }
      }
    )
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
        url,
        ...opt
      },
      function(cookie) {
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

const VALID_URL = /^https?:\/\/[^/]+[:\d+]?[\/]?/;
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
    let targetUrl = targetEl.value || DEFAULT_TARGET_URL;
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
          console.log(`debugging setCookie`, JSON.stringify({
            domain: getWebDomain(targetUrl),
            name: item.name,
            value: item.value,
            path: item.path,
            expirationDate: item.expirationDate
          }));
          return setCookie(targetUrl, {
            domain: getWebDomain(targetUrl),
            name: item.name,
            value: item.value,
            path: item.path,
            expirationDate: item.expirationDate
          })
        })
        Promise.all(allCookie)
          .then(() => {
            showMsg({
              message: `sync from ${sourceUrl} to ${targetUrl} success`
            })
          })
          .cath(e => {
            showMsg({
              message: `sync from ${sourceUrl} to ${targetUrl} failed with error: ${e?.message}`,
              type: 'error'
            })
          });
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
  return new URL(url).hostname
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
  });

  showCookieButton.addEventListener('click', async () => {
    const sourceUrl = sourceEl.value;
    await getCookie(sourceUrl);
  });
}

