import { readFileSync, writeFileSync } from 'fs';

const frontSrc = readFileSync('C:/Users/anime/Downloads/react-native-body-highlighter-main/react-native-body-highlighter-main/assets/bodyFront.ts', 'utf8');
const backSrc = readFileSync('C:/Users/anime/Downloads/react-native-body-highlighter-main/react-native-body-highlighter-main/assets/bodyBack.ts', 'utf8');

const strip = (src, varName, exportName) =>
    src
        .replace(/^import.*;\r?\n/gm, '')
        .replace(`export const ${varName}: BodyPart[] = `, `export const ${exportName} = `);

const out = strip(frontSrc, 'bodyFront', 'BODY_FRONT') + '\n' + strip(backSrc, 'bodyBack', 'BODY_BACK');
writeFileSync('src/bodyData.js', out, 'utf8');
console.log('bodyData.js written');
