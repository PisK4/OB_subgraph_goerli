const axios = require('axios');
const fs = require('fs');

const dataArray = [];
//https://api.studio.thegraph.com/query/49058/obcabin/v0.0.30
axios.post('https://api.studio.thegraph.com/query/49058/obcabin/version/latest',{
  query: `
  {
    mdcs(where: {id: "0x1f510e425f072bff3472ba1d660aab8c8f1897c7"}) {
      bindEBCs {
        ebcs(where: {ebc: "0xb3d1b704dd7f7acf9fddcee2868388838f859e0f"}) {
          ebc
          latestRule {
            chain0
            chain1
            chain0Status
            chain1Status
            chain0CompensationRatio
            chain0ResponseTime
            chain0Token
            chain0TradeFee
            chain0WithholdingFee
            chain0maxPrice
            chain0minPrice
            chain1CompensationRatio
            chain1ResponseTime
            chain1Token
            chain1TradeFee
            chain1WithholdingFee
            chain1maxPrice
            chain1minPrice
            enableTimestamp
            latestUpdateBlockNumber
            latestUpdateHash
            latestUpdateTimestamp
            latestUpdateVersion
            mdc
            ruleValidation
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