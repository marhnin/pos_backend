const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hnin:hnin@cluster0.gbo0s0e.mongodb.net/pos_db');
//mongoose.connect('mongodb://127.0.0.1:27017/pos_db');
//mongoose.connect(process.env.DATABASE);
const invoices = mongoose.model('invoices',{
    cname: String,
    sname: String,
    notes: String,
    created_date: String,
    productData :[]
});
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.all("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
  });
/*save data*/  
app.post("/saveInvoices", (req, res) => {
    var myData = new invoices(req.body);
     myData.save()
      .then(item => {
        res.status(200).send("success");
      })
      .catch(err => {
        res.status(400).send("unable to save to database");
      });
  });

  /*get data*/
  app.get('/getDatas', async (req, res) => {
      let page = Number(req.query.page) - 1;
      var limit = 10;
      var skip = page * limit ;
      var totalCount = await invoices.count();
      if(totalCount == 0){
        return callback('No doucment in database', null);
        }
      const invoiceList = await invoices.find().skip(skip).limit(limit);
      res.json({
              status: true,
              message: 'All invoices fetched',
              data: invoiceList,
              totalRows: totalCount
          })
  })


  app.get('/getByDate', async (req, res) => {
    const invoiceList = await invoices.aggregate([
      {
        "$unwind": "$productData"
      },
      {
        "$set": {
          "total_local_price": {
            "$sum": [
              "$productData.price",
            ]
          }
        }
      },
      {
        $group: {
          _id: { created_date: "$created_date"},
          total_price: {
            $sum: "$total_local_price"
          }
        }
      }
     ])
       res.json({
        status: true,
        message: 'All invoices fetched',
        data: invoiceList
    })
  });
/*listener port*/
app.listen(3000);