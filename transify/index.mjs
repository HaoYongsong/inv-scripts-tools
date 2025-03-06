// const fs = require("fs-extra");
// const parser = require("@babel/parser");
// const { getRemoteLanguages, deleteRemoteLanguage } = require("./remote");
// const _ = require("lodash");
// const { getProjectFiles } = require("./project");

import fs from "fs-extra";
import _ from "lodash";
import parser from "@babel/parser";
import { getProjectFiles } from "./project.mjs";
import { getRemoteLanguages, deleteRemoteLanguage } from "./remote.mjs";
import { traverse } from "./parser.mjs";

const Config = {
  region: "MY",
  includeDeleted: false,
  remote: false,
  dir: "./dist-my",
};

// 排除的 key
const excludesKeys = [
  "invest.notice.failure_reason.error_code.",
  "invest.key_register.field.invalid_error_code.",
  "invest.key_register.field.invalid_error_code.",
  "NAV",
  "AUM",
  "easy_invest.nav.popup_content_adjusted",
  "easy_invest.nav.popup_content",
  "easy_invest.aum.popup_content",
  "prospectus",
  "easy_invest.fund_fact_sheet",
  "prospectus",
  "fund_market.fund_detail_more.fund_fact_sheet",
  "tip_",
  "fund_market.risk_profile.",
  "invest.notice.failure_reason.error_code.",
  "easy_invest.kyc_spay.tax_information",
  "easy_invest.kyc_spay.add_tax",
  "easy_invest.verify_other_bibit_account",
  "easy_invest.verify_your_bibit_account",
  "show_more",
  "show_less",
  "camera.label_p2p_tap_to_turn_off",
  "camera.label_p2p_tap_to_turn_on",
  "camera.label_camera_flash_auto",
  "camera.label_camera_flash_on",
  "camera.label_camera_flash_off",
  "camera.app_permission_camera_denied_",
  "camera.label_p2p_tap_to_turn_off",
  "camera.label_p2p_tap_to_turn_on",
  "camera.",
];

const noStringFileCheck = {
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/components/investment/FundSelection/FundSelectionDrawer.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/modules/configuration/notice/NoticeCenter/adapter/RegisterProcessNotice/calculateNoticeDataConfig.ts": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/modules/user/register/application/my/useGoNextFlow/useConfirmNext/actions/useFailureSetting.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/modules/user/register/application/my/useMountedFlow/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/Common/AccountSetting/components/FundField.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/Common/FundDetails/components/FundChart/widgets/ChartHeader/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/EasyInvest/FundDetail/components/FundChart/components/ChartHeader/ChartHeader.id.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/EasyInvest/FundDetail/MoreDetail/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/Fund/FundDetail/components/FundMoreDetails/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/FundMarket/RiskProfile/components/constant.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/User/KycRegister_MY/components/FailureNotice/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/User/KycRegister_MY/modules/TaxInfoField/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/rn-investment/src/pages/User/KycVerifyBibitAccount/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/inv-common/packages/ui/lib/components/FilterItem/index.ts": true,
  "/Users/yongsong.hao/Documents/shopee/inv-common/packages/ui/src/components/FilterItem/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/inv-common/packages/ui/src/biz/CameraPage/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/inv-common/packages/ui/src/biz/CameraPage/KYCCamera/Components/FlashModePicker/index.tsx": true,
  "/Users/yongsong.hao/Documents/shopee/inv-common/packages/ui/src/biz/CameraPage/Components/QRScannerOverlay/Components/ScanWindow/index.tsx": true,
};

// 全部结果
const i18nCalls = [];

// string 的有效结果
const i18nSet = new Set();
// 非 string 的无效结果
const i18nErrorCalls = [];

// 异常文件
const errorFiles = [];

function push(res) {
  i18nCalls.push(res);
  if (typeof res.value === "string") {
    i18nSet.add(res.value);
  } else {
    i18nErrorCalls.push(res);
  }
}

async function fileResolve(file) {
  const ast = parser.parse(fs.readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  // 遍历 AST

  traverse(ast.program, (v) => {
    return push({ ...v, file });
  });
}

async function main() {
  // 获取项目的全部文件
  const files = await getProjectFiles();

  console.log("🚀 ~ RN 仓库扫描文件总数为:", files.length);
  fs.ensureDirSync(Config.dir);

  console.log("\r\n======= 遍历文件识别是否包含多语言 ======");
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      await fileResolve(file);
    } catch (error) {
      errorFiles.push({ file, error });
      console.log(file);
      console.log("🚀 ~ main ~ error:", error);
    }
  }
  const projectKeys = Array.from(i18nSet);
  fs.writeJSONSync(
    `${Config.dir}/projectKeys.json`,
    { projectKeys },
    { spaces: 2 }
  );

  console.log("🚀 ~ 项目中包含的多语言数量为:", projectKeys.length);
  console.log("      - 非 string 的调用为:", i18nErrorCalls.length);
  for (let index = 0; index < i18nErrorCalls.length; index++) {
    const f = i18nErrorCalls[index].file;
    console.log("            - ", noStringFileCheck[f] ? "✅" : "❌", f);
  }
  console.log("      - 解析失败的文件数量为:", errorFiles.length);
  for (let index = 0; index < errorFiles.length; index++) {
    console.log("            - ", errorFiles[index].file);
  }

  console.log("\r\n======= 多语言平台获取 ======");

  const items = await getRemoteLanguages(
    Config.region,
    Config.includeDeleted,
    Config.remote
  );

  const removeKeys = items
    .filter((item) => !i18nSet.has(item.key))
    .filter((item) => {
      return !excludesKeys.some((key) => item.key.includes(key));
    });

  console.log(
    `🚀 ~ 需要移除: removeKeys(${removeKeys.length}) = Ast(${i18nSet.size}) - excludes)`,
    removeKeys.length
  );

  fs.writeJSONSync(
    `${Config.dir}/removeKeys.json`,
    { removeKeys },
    { spaces: 2 }
  );
  fs.writeJSONSync(
    `${Config.dir}/removeKeys.simple.json`,
    { removeKeys: removeKeys.map((item) => ({ id: item.id, key: item.key })) },
    { spaces: 2 }
  );

  console.log("\r\n======= 移除文件复查(removeKeys 纯文本复查) ======");

  const checkKeys = removeKeys.map((item) => item.key);
  const checkSet = new Set();
  // 先读取所有文件内容并缓存
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    checkKeys
      .filter((key) => content.includes(key))
      .forEach((key) => {
        checkSet.add(key);
      });
  }

  console.log(
    "FILE CONTENT 纯文本匹配 (不准确，可能是备注，或者变量等等)",
    checkSet.size
  );
  fs.writeJSONSync(
    `${Config.dir}/checkKeys.json`,
    { checkKeys: Array.from(checkSet) },
    { spaces: 2 }
  );

  console.log("\r\n======= 最终删除 ======");

  const finallyKeys = removeKeys.filter((item) => !checkSet.has(item.key));
  console.log(
    `🚀 ~ finallyKeys(${finallyKeys.length}) = removeKeys(${removeKeys.length}) - checkKeys(${checkSet.size})`,
    finallyKeys.length
  );
  fs.writeJSONSync(
    `${Config.dir}/finallyKeys.simple.json`,
    {
      finallyKeys: finallyKeys.map((item) => ({ id: item.id, key: item.key })),
    },
    { spaces: 2 }
  );

  await getRemoteLanguages(Config.region, true, true).then((items) => {
    const deleted = items.filter((item) => item.is_deleted);
    console.log("🚀 ~ 回归线上已经删除的 ~ deleted:", deleted.length);
    fs.writeJSONSync(
      `${Config.dir}/deleted.json`,
      {
        deleted,
      },
      { spaces: 2 }
    );
  });
}

main();

// deleteRemoteLanguage(Config.region, {
//   id: 2636589,
// });
