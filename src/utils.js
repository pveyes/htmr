export function hypenColonToCamelCase(str) {
  // convert hypen and colon to camel case
  // color-profile -> colorProfile
  // xlink:role -> xlinkRole
  return str.replace(/(-|:)(.)/g, (match, symbol, char) => {
    return char.toUpperCase();
  });
}
