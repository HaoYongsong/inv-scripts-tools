import glob from "glob";
import path from "path";
import fs from "fs-extra";

export function getFiles(url) {
  return new Promise((resolve, reject) => {
    glob(url, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(
          files.filter((file) => {
            const extension = path.extname(file);
            if (![".ts", ".js", ".tsx", ".jsx"].includes(extension)) {
              return false;
            }
            if (file.endsWith(".d.ts")) {
              return false;
            }
            return true;
          })
        );
      }
    });
  });
}

export async function getProjectFiles() {
  const files = await Promise.all([
    getFiles(`/Users/yongsong.hao/Documents/shopee/rn-investment/src/**/*`),
    getFiles(
      `/Users/yongsong.hao/Documents/shopee/inv-common/packages/*/src/**/*`
    ),
  ]);

  return files.flat();
}
