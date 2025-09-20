const today = new Date(); //今日の日付を取得
const title = `${today.getMonth() + 1}月${today.getDate()}日`;
const storageKey = "wiki-cache";
const storageDateKey = "wiki-cache-date";

document.getElementById("show-event").addEventListener("click", async () => {
  const cachedDate = localStorage.getItem(storageDateKey);
  const cachedData = localStorage.getItem(storageKey);

  if (cachedDate !== title) {
    localStorage.removeItem(storageDateKey);
    localStorage.removeItem(storageKey);
    localStorage.setItem(storageDateKey, title);
  }

  let items = [];

  if (localStorage.getItem(storageKey)) {
    items = JSON.parse(localStorage.getItem(storageKey));
    console.log("キャッシュから取得");
  } else {
    console.log("APIから取得");
    const url = `https://ja.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const targets = ["できごと", "記念日", "記念日・年中行事"];
      const headings = Array.from(doc.querySelectorAll("H2, H3"));

      headings.forEach(heading => {
        if (targets.some(t => heading.textContent.includes(t))) {
          let next = heading.nextElementSibling;
          while (next && !["H2", "H3"].includes(next.tagName)) {
            if (next.tagName === "UL") {
              items.push(...Array.from(next.querySelectorAll("li")).map(li => li.textContent.trim()));
            }
            next = next.nextElementSibling;
          }
        }
      });

      localStorage.setItem(storageKey, JSON.stringify(items));
      localStorage.setItem(storageDateKey, title);
    } catch (error) {
      console.error("取得エラー:", error);
      document.getElementById("result").textContent = "データ取得に失敗しました";
      return;
    }
  }

  const randomItem = items.length
    ? items[Math.floor(Math.random() * items.length)]
    : "該当項目が見つかりませんでした";
  document.getElementById("result").textContent = randomItem;
  document.getElementById("result").style.display = "block";
});
