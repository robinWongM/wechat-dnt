const characterSet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const characterDict: { [key: string]: number } = {};

characterSet.split("").forEach((val, index) => {
  characterDict[val] = index;
});

const padString = (str: string, length: number, padChar: string = "0"): string => {
  return padChar.repeat(length - str.length) + str;
};

/**
 * Encode mid to base62
 * @param mid - The mid to encode
 * @returns {string} - The base62 encoded string
 */
export const encode = (mid: string): string => {
  if (!mid) {
    return "";
  }
  const pad = "0000000";
  mid = padString(mid, Math.ceil(mid.length / 7) * 7);

  const slices = mid.match(/.{1,7}/g) || [];
  const arr = slices.reverse().map(slice => {
    let num = parseInt(slice, 10);
    let s = "";
    while (num > 0) {
      const remain = num % 62;
      s = characterSet[remain] + s;
      num = Math.floor(num / 62);
    }
    return padString(s, 4);
  });

  return arr.reverse().join("").replace(/^0+/, "");
};

/**
 * Decode base62 to mid
 * @param str - The base62 string to decode
 * @returns {string} - The decoded mid
 */
export const decode = (str: string): string => {
  if (!str) {
    return "";
  }

  const slices = chunk(Array.from(str).reverse(), 4).reverse();
  let mid = slices.map(item => {
    let num = 0;
    item.reverse().forEach(char => {
      num = num * 62 + characterDict[char];
    });
    return padString(num.toString(), 7);
  }).join("");

  return mid.replace(/^0+/, "");
};

/**
 * Chunk an array into smaller arrays of specified size
 * @param arr - The array to chunk
 * @param size - The size of each chunk
 * @returns {Array[]} - The chunked array
 */
const chunk = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};
