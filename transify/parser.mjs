// 遍历 AST
export function traverse(node, push) {
  // 检查是否是函数调用
  if (node.type === "CallExpression") {
    // 检查 transifyOptions.tUpper('xxx') 调用
    if (
      node.callee.type === "MemberExpression" &&
      node.callee.object.name === "transifyOptions" &&
      node.callee.property.name === "tUpper" &&
      node.arguments.length > 0
    ) {
      push({
        type: "transifyOptions.tUpper",
        value: node.arguments[0].value,
        loc: node.loc,
      });
    }
    // 检查 transifyOptions.i18n.t('xxx') 调用
    if (
      node.callee.type === "MemberExpression" &&
      node.callee.object.type === "MemberExpression" &&
      node.callee.object.object.name === "transifyOptions" &&
      node.callee.object.property.name === "i18n" &&
      node.callee.property.name === "t" &&
      node.arguments.length > 0
    ) {
      push({
        type: "transifyOptions.i18n.t",
        value: node.arguments[0].value,
        loc: node.loc,
      });
    }

    // 检查 tUpper('xx') 调用
    if (node.callee.name === "tUpper" && node.arguments.length > 0) {
      push({
        type: "tUpper",
        value: node.arguments[0].value,
        loc: node.loc,
      });
    }

    // 检查 i18n.t('xxx') 调用
    if (
      node.callee.type === "MemberExpression" &&
      node.callee.object.name === "i18n" &&
      node.callee.property.name === "t" &&
      node.arguments.length > 0
    ) {
      push({
        type: "i18n.t",
        value: node.arguments[0].value,
        loc: node.loc,
      });
    }
  }

  // 递归遍历所有子节点
  for (const key in node) {
    if (node[key] && typeof node[key] === "object") {
      traverse(node[key], push);
    }
  }
}
