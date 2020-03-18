console.log('NPM Stats extension Loaded (v0.1)');
  const script = document.createElement('script');
  script.textContent = `
  /*******************************************************************************
   * source file '/Users/qui10001/dev/create-extension/build/../client/utils.js'
   ******************************************************************************/
  function timeout(ms) { return new Promise(r => setTimeout(r, ms)); }

/*
 * USAGE:
 * await tillTrue(() => document.querySelector('.thing'));
 */
async function tillTrue(callback, timeout = Infinity) {
  let result = callback();
  const start = Date.now();
  let now = Date.now();
  while (!result && now - start <= timeout) {
    await rafAsync();
    result = callback();
    now = Date.now();
  }
  if (now - start > timeout) throw new Error(\`tillTrue timeout, waited longer than \${timeout} miliseconds\`);
  return result;
}
function rafAsync() { return new Promise(resolve => requestAnimationFrame(resolve)); }

/*
 * USAGE:
 * document.querySelector('.thing').addEventListener('scroll', e => handleScroll(e, cb));
 */
const SCROLL_DELAY = 100;
let lastScroll = Date.now();
let queuedScroll = false;
function handleScroll(e, callback) {
  const epoch = Date.now();
  if (epoch - lastScroll > SCROLL_DELAY) {
    callback();
    lastScroll = Date.now();
  } else if (!queuedScroll) {
    queuedScroll = true; // lock
    setTimeout(() => { // queue a scroll
      callback();
      lastScroll = Date.now();
      queuedScroll = false;
    }, SCROLL_DELAY);
  }
}

/*
 * USAGE:
 * html\`<h1>Hi</h1>\`
 */
function html(arr, ...parts) { return arr.reduce((acc, cur, i) => \`\${acc}\${cur}\${parts[i] || ''}\`, ''); }
function css(arr, ...parts) { return arr.reduce((acc, cur, i) => \`\${acc}\${cur}\${parts[i] || ''}\`, ''); }

/*
 * USAGE:
 * Same as fetch, but with 3rd param option to use local storage cache (and this returns JSON)
 */
async function fetchJson(url, options, useCache = false) { // cache response and return JSON
  if (useCache) {
    const cached = localStorage.getItem(url);
    if (cached) return JSON.parse(cached);
  }
  localStorage.removeItem(url);
  const data = await fetch(url, options).then(res => res.json());
  if (useCache) localStorage.setItem(url, JSON.stringify(data));
  return data;
}

async function fetchHtml(url, options, useCache = false) { // cache response and return HTML
  if (useCache) {
    const cached = localStorage.getItem(url);
    if (cached) return cached;
  }
  localStorage.removeItem(url);
  const data = await fetch(url, options).then(res => res.text());
  if (useCache) localStorage.setItem(url, data);
  return data;
}

function cleanBody(bodyString) {
  const bodyClean = bodyString
    .replace(/<script/g, '<scmipt')
    .replace(/<img /g, '<smimg ')
    .replace(/<iframe/g, '<smiframe')
    .replace(/<style/g, '<smyle');
  return bodyClean;
}

  /*******************************************************************************
   * source file 'src/js/content.js' (wrapped in IIFE)
   ******************************************************************************/
  (async function() {
  async function reprocess() {
    const list = Array.from(document.querySelectorAll('main > div > aside + div section'))
    .map(section => {
      const titleEl = section.querySelector('div > div > a')
      return {
        sectionEl: section,
        titleEl,
        title: titleEl.textContent
      }
    });

    const fetchOptions = {};
    const pArr = list.map(async (item) => await fetchHtml(\`https://www.npmjs.com/package/\${item.title}\`, fetchOptions));
    const listResponses = await Promise.all(pArr);
    listResponses.forEach((data, i) => {
      const parseEl = document.createElement('div');
      parseEl.innerHTML = cleanBody(data);
      const downloadsEl = parseEl.querySelector('.order-0 > div > div > div > p');
      const downloads = downloadsEl ? downloadsEl.textContent : '?';
      const { title, titleEl } = list[i];
      titleEl.textContent = \`\${title} (\${downloads})\`;
    });
}

// process for the 1st time =P
console.log('processing');
await reprocess();
console.log('done processing');


const observer = new MutationObserver(() => reprocess());
observer.observe(document.querySelector('main > div:nth-child(2) > div'), { childList: true });

  })();`;
  document.head.append(script);
  