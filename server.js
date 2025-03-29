const express = require('express');
const request = require('request');
const NodeCache = require('node-cache');

const app = express();
const PORT = 3000;
const linkCache = new NodeCache({ stdTTL: 3600 });

app.get('/proxy', (req, res) => {
  const publicLink = req.query.publicLink;
  if (!publicLink) {
    console.error('������: �������� "publicLink" �� ������.');
    return res.status(400).send('������� ��������� ������ ����� �������� "publicLink".');
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
        console.error("������ ��� �������� �����:", fileErr);
        res.status(500).send("������ ��� �������� �����.");
      });
  }

  if (directLink) {
    console.log("���������� ������������ ������ ������:", directLink);
    streamFile();
  } else {
    const apiUrl = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(publicLink);
    
    request({ url: apiUrl, json: true }, (err, apiResponse, apiBody) => {
      if (err) {
        console.error("������ ������� � API ������-�����:", err);
        return res.status(500).send("������ ������� � API ������-�����.");
      }
      if (apiResponse.statusCode !== 200) {
        console.error("API ������-����� ������ ���:", apiResponse.statusCode);
        return res.status(500).send(`������ API: ${apiResponse.statusCode} ${apiResponse.statusMessage}`);
      }
      if (!apiBody.href) {
        console.error("����� API �� �������� ���� href:", apiBody);
        return res.status(500).send("������ ������ �� ������� � ������ API.");
      }
      
      directLink = apiBody.href;
      linkCache.set(cacheKey, directLink);
      console.log("����� ������ ������ �������� � ������������:", directLink);
      streamFile();
    });
  }
});

app.listen(PORT, () => {
  console.log(`������-������ ������� � �������� �� ������: http://localhost:${PORT}`);
});
