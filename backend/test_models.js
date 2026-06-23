const apiKey = "AIzaSyD9z_WVstFQclmuTmp3X-ymiqWrRuJgtVw";

async function run() {
  const url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
