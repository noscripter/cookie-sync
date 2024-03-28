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

function showError(message) {
  const msgEl = document.querySelector('#msg');
  msgEl.innerHTML = `<p style="color: red; font-weight: bold">${message || '出错了'}</p>`
}

window.onload = function() {
  const targetEl = document.querySelector('#target');
  const syncButton = document.querySelector('#sync');

  syncButton.addEventListener('click', function() {
    console.log('clicked', targetEl.value);
    getCurrentTab(function(tabs) {
      try {
        const sourceUrl = tabs[0].url;
        console.log('sourceUrl', sourceUrl);
        const targetUrl = targetEl.value;
        if (/^https?:\/\/[^/]+\//.test(targetUrl)) {
        } else {
          showError('invalid URL(should match `/^https?:\/\/[^/]+\//`)');
        }
      } catch (e) {
        showError(e.message);
      }
    })
  });
}

