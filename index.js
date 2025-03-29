const publicLink = "https://disk.yandex.by/i/xYAMajcsnamECQ";
const apiUrl = "https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=" + encodeURIComponent(publicLink);

async function getDirectVideoLink() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`������ �������: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.href) {
      console.log("������ ������ ��������:", data.href);
      // ����� ����� ��������� ������, ��������� � � ������ ��� ������������ ��� �������.
    } else {
      console.error("����� API �� �������� href:", data);
    }
  } catch (error) {
    console.error("������ ��� ���������� �������:", error);
  }
}

getDirectVideoLink();