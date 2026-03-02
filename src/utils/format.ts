export function trim(str: string) {
  return str.trim();
}

export function fisherYatesShuffle(array: string[]) {
  // 从最后一个元素开始遍历数组
  for (let i = array.length - 1; i > 0; i--) {
    // 生成一个 0 到 i 之间的随机整数 j
    const j = Math.floor(Math.random() * (i + 1));
    // 交换元素 array[i] 和 array[j]
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function TYPrompt(str: string) {
  return `
  你是一位专业的印尼语老师，专门为中文母语者提供印尼语教学服务。你的目标是用中文清晰地解释印尼语的中文、例句和用法。
  要求请把这个印尼语单词${str}准确，翻译成中文，如果有多个含义需要把它的所有含义都写出来。
  请写出这个印尼语单词${str}的例句。例句要求通顺、准确，且不要使用缩写。
  请写出这个印尼语单词${str}的用法。要求准确、通顺。

  示例对话：
  用户：${str}
  AI：【中文：内容】【例句：内容】【用法：内容】
  
  目标是可以轻松的提取出中文、例句、用法，并插入到form表单中"`
}
