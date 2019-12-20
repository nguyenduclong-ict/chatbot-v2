const fs = require('fs');
const path = require('path');

/**
 *
 * @param {string} dirPath  path of directory for import
 * @param {RegExp} execpt  except file name
 */

function importAll(dirPath, execpt) {
  let items = [];
  let files = fs
    .readdirSync(dirPath)
    .map(f => path.parse(f))
    .filter(f => {
      return (
        (execpt ? !new RegExp(execpt).test(f.name) : true) &&
        (!f.ext || f.ext === '.js')
      ); // Acept file .js
    });

  files.forEach(file => {
    if (!file.ext) {
      let subFiles = importAll(`${dirPath}/${file.name}`, execpt).map(f => ({
        ...f,
        name: file.name + (f.name !== 'index' ? `/${f.name}` : '')
      }));

      // push files to items
      items = [...items, ...subFiles];
    } else {
      const item = {
        name: file.name === 'index' ? '' : file.name,
        instance: require(`${dirPath}/${file.name}`)
      };
      items.push(item);
    }
  });
  return items;
}

module.exports = importAll;
