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
    const pArr = list.map(async (item) => await fetchHtml(`https://www.npmjs.com/package/${item.title}`, fetchOptions));
    const listResponses = await Promise.all(pArr);
    listResponses.forEach((data, i) => {
      const parseEl = document.createElement('div');
      parseEl.innerHTML = cleanBody(data);
      const downloadsEl = parseEl.querySelector('.order-0 > div > div > div > p');
      const downloads = downloadsEl ? downloadsEl.textContent : '?';
      const { title, titleEl } = list[i];
      titleEl.textContent = `${title} (${downloads})`;
    });
}

// process for the 1st time =P
await reprocess();

const observer = new MutationObserver(() => reprocess());
observer.observe(document.querySelector('main > div:nth-child(2) > div'), { childList: true });
