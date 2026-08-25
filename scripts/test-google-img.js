const { GOOGLE_IMG_SCRAP } = require('google-img-scrap');

async function test() {
  try {
    const res = await GOOGLE_IMG_SCRAP({
      search: "Set Đồ Ngủ Lụa Pijama clothing fashion",
      limit: 3
    });
    console.log("Found:", res.result.map(r => r.url));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
