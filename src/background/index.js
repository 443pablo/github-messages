chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    if (request.scheme === 'dark') {
        chrome.action.setIcon({
            path: {
                '16': '../icons/white/16.png',
                '32': '../icons/white/32.png',
                '64': '../icons/white/64.png',
                '128': '../icons/white/128.png'
            }
        });
    } else if (request.scheme === 'light') {
        chrome.action.setIcon({
            path: {
                '16': '../icons/black/16.png',
                '32': '../icons/black/32.png',
                '64': '../icons/black/64.png',
                '128': '../icons/black/128.png'
            }
        });
    }
});

chrome.action.onClicked.addListener(
  function (tab) {
    console.log('Icon clicked', tab);
    chrome.tabs.create({url: "https://github.com/messages"})
  }
);