
chrome.browserAction.onClicked.addListener(function (tab)
{
  if (tab.url.indexOf("https://optimovision.tv/") != -1)
  {
    chrome.tabs.executeScript(tab.id, {
      "file": "optimovision.js"
    }, function ()
    {
      console.log("[CEO] Executing...");
    });

    chrome.runtime.onMessage.addListener(
      function (msg)
      {
        chrome.downloads.download({
          url: msg.video.url,
          filename: msg.video.filename + ".mp4",
          conflictAction: "uniquify",
          saveAs: false
        });
      });
  }
});
