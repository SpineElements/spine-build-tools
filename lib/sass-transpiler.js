/*
  Copyright (c) 2000-2018 TeamDev. All rights reserved.
  TeamDev PROPRIETARY and CONFIDENTIAL.
  Use is subject to license terms.
*/

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const nodeSass = require('node-sass');
const recursiveImporter = require('node-sass-import');
const replaceExt = require('replace-ext');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const transpileSass = promisify(nodeSass.render);

const PLACEHOLDER = '{{stylesPlaceholder}}';
const UTF8 = 'utf-8';
const DEFAULT_TEMPLATE =  path.resolve(__dirname, './default-template.js');

exports.sassToCss = async function sassToCss(sassSrc, templateSrc = DEFAULT_TEMPLATE, out) {
    const template = await readFile(templateSrc, UTF8);

    if (template.indexOf(PLACEHOLDER) > -1) {
        const transpiledSass = await transpileSass({file: sassSrc, importer: recursiveImporter});
        const css = transpiledSass.css.toString();
        const result = template.replace(PLACEHOLDER, css);

        let outputFile = out ? out : replaceExt(sassSrc, '.js');
        return writeFile(outputFile, result, UTF8);
    }

    throw new Error(`Template must contain "${PLACEHOLDER}" placeholder for a resulting css.`);
};
