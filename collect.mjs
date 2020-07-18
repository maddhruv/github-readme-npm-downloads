import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import table from 'markdown-table';
import markdownMagic from 'markdown-magic';
import npmtotal from 'npmtotal'

import json from './utils/json.mjs';

const { "npm-stats": key } = json('./package.json');
const badgeStats = json('./stats.json');


if (!key) {
  throw new Error("Please add `npm-stats` to your package.json");
}

(async () => {
  const stats = await npmtotal(key, {
    startDate: "2017-01-01"
  });

  const sortedStats = stats.stats.map(pkg => {
    const [name, count] = pkg;
    return [`[${name}](https://www.npmjs.com/package/${name})`, count];
  });

  badgeStats.message = `${stats.sum} Downloads`;

  await fs.writeFileSync("./stats.json", JSON.stringify(badgeStats, null, 2));

  generate(sortedStats, stats.sum);
})();

function generate(data, sum) {
  const config = {
    transforms: {
      PACKAGES() {
        return table([
          ["Name", "Downloads"],
          ...data,
          ["**Sum**", `**${sum}**`]
        ]);
      }
    }
  };

  markdownMagic(path.join("README.md"), config, () => {
    console.log(`Updated total downloads - ${sum}`);
  });
}
