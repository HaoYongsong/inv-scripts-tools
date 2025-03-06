const axios = require("axios");
const fs = require("fs-extra");

const Authorization = fs.readFileSync(
  __dirname + "/Authorization.txt",
  "utf-8"
);

const Region = {
  ID: "/api/v1/projects/1577/resources/3646/entries",
  MY: "/api/v1/projects/1577/resources/5750/entries",
};

const TRANSIFY_URL = "https://transify.sea.com";

async function getRemoteLanguages(
  region,
  include_deleted = false,
  remote = false
) {
  console.log(
    "正在获取 Transify 平台数据",
    region,
    include_deleted ? "包含已删除数据" : "不包含已删除数据",
    remote ? "远程获取" : "本地获取"
  );

  const url = `./remote/${Region[region]}`;
  fs.ensureDirSync(url);

  const { data } = remote
    ? await axios.get(`${TRANSIFY_URL}${Region[region]}`, {
        headers: { Authorization },
        params: { include_deleted: String(include_deleted) },
      })
    : { data: fs.readJSONSync(`${url}/languages.json`) };

  console.log("Transify 平台合计数量", data?.data?.items?.length);

  if (remote) {
    fs.writeJSONSync(`${url}/languages.json`, data, { spaces: 2 });
  }

  return data?.data?.items;
}

async function deleteRemoteLanguage(region, item) {
  console.log("正在删除 Transify 平台数据", region, item);

  const { data } = await axios.delete(
    `${TRANSIFY_URL}${Region[region]}/${item.id}`,
    { headers: { Authorization } }
  );
  console.log("🚀 ~ deleteRemoteLanguage ~ data:", data);

  // console.log("Transify 平台删除数量", data?.data?.items?.length);
}

module.exports = {
  Region,
  getRemoteLanguages,
  deleteRemoteLanguage,
};
