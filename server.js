const express = require('express');
const request = require('request');
const NodeCache = require('node-cache');

const app = express();
const PORT = 3000;
const linkCache = new NodeCache({ stdTTL: 3600 });

app.get('/proxy', (req, res) => {
  const publicLink = req.query.publicLink;
  if (!publicLink) {
    console.error('Ошибка: параметр "publicLink" не указан.');
    return res.status(400).send('Укажите публичную ссылку через параметр "publicLink".');
  }

  const cacheKey = publicLink;
  let directLink = linkCache.get(cacheKey);

  function streamFile() {
    const options = {
      url: directLink,
      headers: {}
    };

    if (req.headers.range) {
      options.headers.Range = req.headers.range;
    }

    request(options)
      .on('response', (fileResponse) => {
        delete fileResponse.headers['content-disposition'];
          res.setHeader('Access-Control-Allow-Origin', 'https://sm6688.ru');
          res.setHeader('Accept-Ranges', 'bytes');
      })
      .pipe(res)
      .on('error', (fileErr) => {
        console.error("Ошибка при передаче файла:", fileErr);
        res.status(500).send("Ошибка при загрузке видео.");
      });
  }

  if (directLink) {
    console.log("Используем кэшированную прямую ссылку:", directLink);
    streamFile();
  } else {
    const apiUrl = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(publicLink);
    
    request({ url: apiUrl, json: true }, (err, apiResponse, apiBody) => {
      if (err) {
        console.error("Ошибка запроса к API Яндекс-Диска:", err);
        return res.status(500).send("Ошибка запроса к API Яндекс-Диска.");
      }
      if (apiResponse.statusCode !== 200) {
        console.error("API Яндекс-Диска вернул код:", apiResponse.statusCode);
        return res.status(500).send(`Ошибка API: ${apiResponse.statusCode} ${apiResponse.statusMessage}`);
      }
      if (!apiBody.href) {
        console.error("Ответ API не содержит поле href:", apiBody);
        return res.status(500).send("Прямая ссылка не найдена в ответе API.");
      }
      
      directLink = apiBody.href;
      linkCache.set(cacheKey, directLink);
      console.log("Новая прямая ссылка получена и закэширована:", directLink);
      streamFile();
    });
  }
});

app.listen(PORT, () => {
  console.log(`Прокси-сервер запущен и доступен по адресу: http://localhost:${PORT}`);
});
