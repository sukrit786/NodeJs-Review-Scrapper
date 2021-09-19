
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000
config = require('config')
const env = "dev"
const logg = require('./services/logging');
const scrapi = require('./services/scrap')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
logg.log("SERVER FILE SAYS","happy bday santa")

app.post('/url', async(req, res) => {
    // https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=640254&CatId=3839 3_reviews
    // https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=6659197&CatId=5469 41_reviews
    // https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=54563&CatId=3839 no_reviews
    // https://www.tigerdirect.com/applications/SearchTools/item-details.asp?EdpNo=995645234&CatId=3839 invalid_url
    try {
        let res_data = await scrapi.getData(req.body.url)
        res.statusCode = 200
        res.send({code:res.statusCode,msg:res_data})
    } catch(err) {
        res.statusCode = 400
        res.send({code:res.statusCode,msg:"Invalid Url"})
    }
    // logg.log("MAIN_PAGE",res_data)
})

app.listen(process.env.PORT||config.get('port'), () => {
  console.log(`Example app listening at http://localhost:${config.get('port')}`)
})
