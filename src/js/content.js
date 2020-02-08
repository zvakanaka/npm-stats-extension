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
  const downloads = parseEl.querySelector('.order-0 > div > div > div > p').textContent;
  const { title, titleEl } = list[i];
  titleEl.textContent = `${title} (${downloads})`;
});
