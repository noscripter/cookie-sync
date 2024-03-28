/**
 * 获取当前tab
 * @param  {function}  cb  [回调函数]
 */
function getCurrentTab(cb) {
  try {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {
        cb && cb(tabs)
      }
    )
  } catch (error) {
    console.log(error)
  }
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
      color = 'red';
      break;
    }
    case 'info': {
      color = 'blue';
      break;
    }
    default: {
      color = 'black';
      break;
    }
  }
  msgEl.innerHTML = `<p style="color: ${color}; font-weight: bold">${message}</p>`
}

window.onload = function() {
  const targetEl = document.querySelector('#target');
  const syncButton = document.querySelector('#sync');
  const syncCurrentButton = document.querySelector('#syncCurrent');

  syncButton.addEventListener('click', async function() {
    try {
      console.log('sourceUrl', sourceUrl);
      const targetUrl = targetEl.value;
      if (/^https?:\/\/[^/]+\//.test(targetUrl)) {
        // clear error message
        const cookie = await getAllCookie(targetUrl);
        showMsg({
          message: `current cookie: ${JSON.stringify(cookie, null, '\t')}`,
          type: 'info',
        })
      } else {
        showMsg({
          message: 'invalid URL(should match `/^https?:\/\/[^/]+\//`)',
          type: 'error',
        });
      }
    } catch (e) {
      showMsg({ message: e.message, type: 'error' });
    }
  });

  syncCurrentButton.addEventListener('click', function() {
    getCurrentTab(async function(tabs) {
      try {
        const sourceUrl = tabs[0].url;
        console.log('sourceUrl', sourceUrl);
        const targetUrl = targetEl.value;
        if (/^https?:\/\/[^/]+\//.test(targetUrl)) {
          // clear error message
          const cookie = await getAllCookie(sourceUrl);
          showMsg({
            message: `current cookie: ${JSON.stringify(cookie, null, '\t')}`,
            type: 'info',
          })
        } else {
          showMsg({
            message: 'invalid URL(should match `/^https?:\/\/[^/]+\//`)',
            type: 'error',
          });
        }
      } catch (e) {
        showMsg({ message: e.message, type: 'error' });
      }
    })
  });
}

