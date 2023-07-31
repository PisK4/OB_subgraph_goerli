const axios = require('axios');
const fs = require('fs');

const dataArray = [];
//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/cabin/version/latest',{
  query: `
  {
    mdcs {
      id
      bindEBCs {
        id
        ebcs(where: {ebc: "0x422ce07aff721b109490f4d7a5a92f16aef8ad7a"}) {
          id
          latestRule {
            chain0
            chain1
            chain0Status
            chain1Status
            latestUpdateBlockNumber
            latestUpdateHash
            latestUpdateTimestamp
            latestUpdateVersion
            mdc
          }
          rulesWithRootVersion {
            root
            version
            rules {
              chain0
              chain1
              chain0Status
              chain1Status
            }
          }
        }
      }
    }
  }`
}).then((result) => {
    for (const resultGet of result.data.data.mdcs) {
        console.log(resultGet);
        dataArray.push(resultGet);
    }
    // const data = JSON.stringify(dataArray, null, 2);
    // fs.writeFile('./scriptsOutput/output.json', data, (err) => {
    //     if (err) throw err;
    // });
}).catch((error) => {
    console.log(error);
});