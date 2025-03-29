const publicLink = "https://disk.yandex.by/i/xYAMajcsnamECQ";
const apiUrl = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(publicLink);

async function getDirectVideoLink() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.href) {
      console.log("Прямая ссылка получена:", data.href);
      // Здесь можно сохранить ссылку, отправить её в клиент или использовать для галереи.
    } else {
      console.error("Ответ API не содержит href:", data);
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
  }
}

getDirectVideoLink();