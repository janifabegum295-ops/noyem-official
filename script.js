const API_URL = 'https://script.google.com/macros/s/AKfycbz-gsdHeQbV6KKCDNiHy7j65Kj6DYFR9StCDbZzsJPq0V48ZkxjBDzQMKEYzQQyZh2h/exec';

document.addEventListener('DOMContentLoaded', () => {

  // Footer year
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Advertisement skip
  const skip = document.getElementById('skip');
  if (skip) {
    skip.onclick = () => {
      const ad = document.querySelector('.ad');
      if (ad) ad.remove();
    };
  }

  // Mobile menu
  const menu = document.getElementById('menu');

  if (menu) {
    menu.onclick = () => {
      const nav = document.querySelector('nav');

      if (!nav) return;

      nav.style.display =
        nav.style.display === 'flex' ? 'none' : 'flex';

      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.right = '6%';
      nav.style.top = '65px';
      nav.style.padding = '16px';
      nav.style.background = '#10152b';
      nav.style.borderRadius = '14px';
    };
  }

  // Load Google Sheet content
  loadSheetData();
});


function loadSheetData() {

  const callbackName =
    'noyemSheetCallback_' + Date.now();

  window[callbackName] = function(response) {

    try {

      if (!response || !response.ok) {
        showMessage('movieList', 'Content could not be loaded.');
        showMessage('aiList', 'Content could not be loaded.');
        showMessage('downloadList', 'Content could not be loaded.');
        return;
      }

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      renderMovies(data);
      renderAI(data);
      renderDownloads(data);

    } catch (error) {

      console.error(error);

    }

    delete window[callbackName];

    const oldScript =
      document.getElementById('noyem-api-script');

    if (oldScript) {
      oldScript.remove();
    }
  };


  const script = document.createElement('script');

  script.id = 'noyem-api-script';

  script.src =
    API_URL +
    '?callback=' +
    encodeURIComponent(callbackName);

  script.onerror = function() {

    showMessage(
      'movieList',
      'Unable to load website content.'
    );

    showMessage(
      'aiList',
      'Unable to load website content.'
    );

    showMessage(
      'downloadList',
      'Unable to load website content.'
    );

  };

  document.body.appendChild(script);
}


function getType(item) {

  return String(item.Type || '')
    .trim()
    .toLowerCase();

}


function getDriveUrl(url) {

  if (!url) return '';

  url = String(url).trim();

  // Google Drive file URL
  const match =
    url.match(/\/file\/d\/([^/]+)/);

  if (match) {

    return 'https://drive.google.com/uc?export=view&id='
      + match[1];

  }

  return url;
}


function createImage(url, title) {

  if (!url) return null;

  const img = document.createElement('img');

  img.src = getDriveUrl(url);

  img.alt = title || 'Noyem Official';

  img.loading = 'lazy';

  img.style.width = '100%';
  img.style.maxHeight = '420px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '14px';
  img.style.marginBottom = '15px';

  return img;
}


function createButton(text, url) {

  const a = document.createElement('a');

  a.className = 'btn small';

  a.textContent = text;

  a.href = url;

  a.target = '_blank';

  a.rel = 'noopener noreferrer';

  return a;
}


function createCard() {

  const article = document.createElement('article');

  article.className = 'card';

  return article;
}


function renderMovies(data) {

  const container =
    document.getElementById('movieList');

  if (!container) return;

  container.innerHTML = '';

  const movies = data.filter(item => {

    const type = getType(item);

    return type === 'movie' ||
           type === 'video';

  });


  if (movies.length === 0) {

    container.innerHTML = `
      <article class="card">
        <div class="video">🎬</div>
        <h3>No Movies Added Yet</h3>
        <p>
          Add a movie in the Google Sheet and it
          will appear here automatically.
        </p>
      </article>
    `;

    return;
  }


  movies.forEach(item => {

    const card = createCard();

    const image =
      createImage(item.Photo, item.Title);

    if (image) {
      card.appendChild(image);
    } else {

      const video =
        document.createElement('div');

      video.className = 'video';

      video.textContent = '🎬';

      card.appendChild(video);
    }


    const title =
      document.createElement('h3');

    title.textContent =
      item.Title || 'Untitled Video';

    card.appendChild(title);


    if (item.Description) {

      const description =
        document.createElement('p');

      description.textContent =
        item.Description;

      card.appendChild(description);
    }


    const buttons =
      document.createElement('div');

    if (item['Video Link']) {

      buttons.appendChild(
        createButton(
          '▶ Watch Video',
          item['Video Link']
        )
      );

    }


    if (item['Download Link']) {

      buttons.appendChild(
        createButton(
          '⬇ Download',
          item['Download Link']
        )
      );

    }

    card.appendChild(buttons);

    container.appendChild(card);

  });

}


function renderAI(data) {

  const container =
    document.getElementById('aiList');

  if (!container) return;

  container.innerHTML = '';


  const items = data.filter(item =>
    getType(item) === 'ai'
  );


  if (items.length === 0) {

    container.innerHTML = `
      <article class="card">
        <div class="video">🖼️</div>
        <h3>No AI Images Added Yet</h3>
        <p>
          Add an AI image and prompt in the Google Sheet.
        </p>
      </article>
    `;

    return;
  }


  items.forEach(item => {

    const card = createCard();

    const image =
      createImage(item.Photo, item.Title);

    if (image) {

      card.appendChild(image);

      if (item.Photo) {

        const download =
          createButton(
            '⬇ Download Image',
            item.Photo
          );

        card.appendChild(download);
      }

    }


    const title =
      document.createElement('h3');

    title.textContent =
      item.Title || 'AI Image';

    card.appendChild(title);


    if (item.Description) {

      const description =
        document.createElement('p');

      description.textContent =
        item.Description;

      card.appendChild(description);
    }


    if (item['AI Prompt']) {

      const promptTitle =
        document.createElement('strong');

      promptTitle.textContent =
        'AI Prompt';

      card.appendChild(promptTitle);


      const prompt =
        document.createElement('pre');

      prompt.textContent =
        item['AI Prompt'];

      prompt.style.whiteSpace = 'pre-wrap';

      prompt.style.background = '#ffffff08';

      prompt.style.padding = '12px';

      prompt.style.borderRadius = '10px';

      prompt.style.overflowX = 'auto';

      card.appendChild(prompt);


      const copy =
        document.createElement('button');

      copy.className = 'btn small';

      copy.textContent =
        '📋 Copy Prompt';


      copy.onclick = async () => {

        try {

          await navigator.clipboard.writeText(
            item['AI Prompt']
          );

          copy.textContent =
            '✅ Copied';

          setTimeout(() => {

            copy.textContent =
              '📋 Copy Prompt';

          }, 1500);

        } catch (error) {

          alert('Copy failed. Please copy the prompt manually.');

        }

      };


      card.appendChild(copy);

    }


    container.appendChild(card);

  });

}


function renderDownloads(data) {

  const container =
    document.getElementById('downloadList');

  if (!container) return;

  container.innerHTML = '';


  const items = data.filter(item => {

    const type = getType(item);

    return type === 'apk' ||
           type === 'download';

  });


  if (items.length === 0) {

    container.innerHTML = `
      <article class="card">
        <div class="video">📱</div>
        <h3>No Downloads Added Yet</h3>
        <p>
          Add an APK or download item in the Google Sheet.
        </p>
      </article>
    `;

    return;
  }


  items.forEach(item => {

    const card = createCard();

    const image =
      createImage(item.Photo, item.Title);

    if (image) {
      card.appendChild(image);
    } else {

      const icon =
        document.createElement('div');

      icon.className = 'video';

      icon.textContent =
        getType(item) === 'apk'
          ? '📱'
          : '⬇';

      card.appendChild(icon);
    }


    const title =
      document.createElement('h3');

    title.textContent =
      item.Title || 'Download';

    card.appendChild(title);


    if (item.Description) {

      const description =
        document.createElement('p');

      description.textContent =
        item.Description;

      card.appendChild(description);
    }


    if (item['Download Link']) {

      const buttonText =
        getType(item) === 'apk'
          ? '⬇ Download APK'
          : '⬇ Download';

      card.appendChild(
        createButton(
          buttonText,
          item['Download Link']
        )
      );

    }


    container.appendChild(card);

  });

}


function showMessage(id, message) {

  const container =
    document.getElementById(id);

  if (!container) return;

  container.innerHTML = '';

  const card =
    document.createElement('article');

  card.className = 'card';

  const text =
    document.createElement('p');

  text.textContent = message;

  card.appendChild(text);

  container.appendChild(card);

}
