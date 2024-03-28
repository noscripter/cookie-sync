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
  msgEl.innerHTML = `<p style="color: ${color}; font-weight: bolder; font-size: 1.2rem;">${message}</p>`
}

const VALID_URL = /^https?:\/\/[^/]+[:\d+]?[\/]?/;
const DEFAULT_TARGET_URL = 'http://localhost:3333';

async function syncCookie(sourceEl, targetEl) {
  try {
    const sourceUrl = sourceEl.value;
    const targetUrl = targetEl.value;
    if (targetUrl === "") {
      targetEl.value = DEFAULT_TARGET_URL;
    }
    if (!VALID_URL.test(sourceEl.value)) {
      showMsg({
        message: `sourceUrl invalid`,
        type: 'error',
      });
    } else if (!VALID_URL.test(targetEl.value)) {
      showMsg({
        message: `targetUrl invalid`,
        type: 'error',
      });
    } else {
      const cookie = await getAllCookie(sourceUrl);
      showMsg({
        message: `domain: ${sourceUrl}<br> cookie: <pre style="color: #FFF; font-size: 1.2rem; font-weight: bolder;">${JSON.stringify(cookie, null, '\t')}</pre>`,
        type: 'info',
      })
    }
  } catch (e) {
    showMsg({ message: e.message, type: 'error' });
  }
}

window.onload = function() {
  const sourceEl = document.querySelector('#source');
  const targetEl = document.querySelector('#target');
  const syncButton = document.querySelector('#sync');
  const syncCurrentButton = document.querySelector('#syncCurrent');

  syncButton.addEventListener('click', async () => {
    await syncCookie(sourceEl, targetEl);
  });

  syncCurrentButton.addEventListener('click', async () => {
    const tabs = await getCurrentTab();
    const sourceUrl = tabs[0].url;
    sourceEl.value = sourceUrl;
    await syncCookie(sourceEl, targetEl)
  });
}

