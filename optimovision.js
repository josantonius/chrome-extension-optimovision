let items = []
let fromChapter = downloadFromChapter()
let prefix = chapterPrefix()

function downloadFromChapter()
{
  return prompt("Download from chapter:", 1)
}

function chapterPrefix()
{
  return prompt("File name prefix:", "")
}

function getVideoList(document)
{
  return document.querySelectorAll('#list_videos > div')
}

function getNextPageUrl(document)
{
  let nextPage = document.querySelector('.prevnext')
  return nextPage ? nextPage.href : false
}

function getDownloadUrl(document)
{
  return document.querySelector(
    '.meta-video-bottom > div:nth-child(2) > .div_ho > a'
  ).href
}

function getVideoUrl(item)
{
  return item.querySelector('.pmla').href
}

function getChapter(item)
{
  return item.querySelector('.pmla').href.split('-').pop()
}

function randomIntFromInterval(min, max)
{
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function downloadVideo(url, filename)
{
  chrome.runtime.sendMessage({
    video: {
      url: url,
      filename: filename
    }
  })
}

function sleep(time)
{
  return new Promise((resolve) => setTimeout(resolve, time))
}

function downloadChapter(item)
{
  let filename = prefix + getChapter(item)
  let page = window.open(getVideoUrl(item))

  page.onload = function ()
  {
    downloadVideo(getDownloadUrl(page.document), filename)
    setTimeout(() =>
    {
      page.close()
    }, 1000)
  }
}

function downloadVideos(items)
{
  let time = 1000
  for (let index = 0; index < items.length; index++)
  {
    setTimeout(() =>
    {
      downloadChapter(items[index])
    }, time)

    time = time + randomIntFromInterval(60000, 61000)
  }
}

function filterChapters(document, from)
{
  let array = null

  if (from.indexOf(' ') !== -1)
  {
    array = from.split(' ')
    array = array.map(function (number)
    {
      return parseInt(number)
    })
  }

  getVideoList(document).forEach(item =>
  {
    let chapter = getChapter(item)

    if (!array && (parseInt(chapter) >= parseInt(from)))
    {
      items.push(item)
    } else if (array && array.includes(parseInt(chapter)))
    {
      items.push(item)
    }
  })
}

async function getAllAvailableChapters(document, fromChapter, isFirst)
{
  filterChapters(document, fromChapter)
  let nextPage = getNextPageUrl(document)

  if (nextPage)
  {
    await sleep(randomIntFromInterval(1000, 3000))
    let page = window.open(nextPage)
    page.onload = function ()
    {
      getAllAvailableChapters(page.document, fromChapter)
      page.close()
    }
  }

  if (!nextPage && !isFirst)
  {
    document.close()
  }

  if (!nextPage)
  {
    await sleep(randomIntFromInterval(2000, 3000))
    downloadVideos(items)
  }
}

getAllAvailableChapters(document, fromChapter, true)

