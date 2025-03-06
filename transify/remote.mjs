import fs from "fs-extra";
import axios from "axios";

import { fileURLToPath } from "url";
import { dirname } from "path";

// 获取当前模块的文件路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前模块所在的目录路径
const __dirname = dirname(__filename);

export const Authorization = fs.readFileSync(
  __dirname + "/Authorization.txt",
  "utf-8"
);

export const Region = {
  ID: "/api/v1/projects/1577/resources/3646/entries",
  MY: "/api/v1/projects/1577/resources/5750/entries",
};

export const TRANSIFY_URL = "https://transify.sea.com";

export async function getRemoteLanguages(
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

export async function getDeletedLanguages(region) {
  const { data } = await axios.get(`${TRANSIFY_URL}${Region[region]}`, {
    headers: { Authorization },
    params: { include_deleted: "true" },
  });
  const deleted = data?.data?.items.filter((item) => item.is_deleted);

  const url = `./remote/${Region[region]}`;
  fs.ensureDirSync(url);
  fs.writeJSONSync(`${url}/languages.deleted.json`, { deleted }, { spaces: 2 });

  return deleted;
}

export async function deleteRemoteLanguage(region, item) {
  console.log("正在删除 Transify 平台数据", region, item);

  const { data } = await axios.delete(
    `${TRANSIFY_URL}${Region[region]}/${item.id}`,
    { headers: { Authorization } }
  );
  console.log("🚀 ~ deleteRemoteLanguage ~ data:", data);

  // console.log("Transify 平台删除数量", data?.data?.items?.length);
}
