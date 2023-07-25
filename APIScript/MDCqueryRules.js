const axios = require('axios');
const fs = require('fs');

const dataArray = [];

axios.post('https://api.studio.thegraph.com/query/49058/obcabin/version/latest',{
  query: `
  {
    mdcs {
      id
      bindEBC(first: 1) {
        id
        rules {
          root
          version
          rules {
            chain0
            chain0CompensationRatio
            chain0ResponseTime
            chain0Status
            chain0Token
            chain0TradeFee
            chain0WithholdingFee
            chain0maxPrice
            chain0minPrice
            chain1
            chain1CompensationRatio
            chain1ResponseTime
            chain1Status
            chain1Token
            chain1TradeFee
            chain1WithholdingFee
            chain1maxPrice
            chain1minPrice
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