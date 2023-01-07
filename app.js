import express from 'express';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';
import hbs_sections from 'express-handlebars-sections'
import homePageRoute from "./routes/homePage.route.js";
import adminRoute from "./routes/admin.route.js";
import numeral from 'numeral';

const app = express();
app.use(express.urlencoded({
  extended: true
}));
//app.use(express.static(__dirname + '/public'));
app.use('/public', express.static('public'));

app.engine('hbs', engine({
  // defaultLayout: 'main.hbs'
  extname: 'hbs',
  defaultLayout: 'main',
  helpers: {
    section: hbs_sections(),
    format_number(val) {
      return numeral(val).format('0,0');
    },
    renderStars(rating){
      let result = '';
      for (let i = 1; i <= 5; i++) {
        let checked = rating >= i ? ' checked' : '';
        result += `<span class='fa fa-star${checked}'></span>`;
      }
      return new Handlebars.SafeString(result);
    },
    loopProduct(idx){
      if(idx <= 4)
        return true;
      else
        return false;

    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

// Handlebars.registerHelper('renderStars', (rating) => {
//   let result = '';
//   for (let i = 1; i <= 5; i++) {
//     let checked = rating >= i ? ' checked' : '';
//     result += `<span class='fa fa-star${checked}'></span>`;
//   }
//   return new Handlebars.SafeString(result);
// });
// app.use(async function (req, res, next) {
//   res.locals.lcCategories = await categoryService.findAllWithDetails();
//   next();
// });

app.get('/', function (req, res) {
  // res.send('Hello World.');
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about');
})
// app.get('/homePage', function(req, res){
//   res.render('vwHomePage/homePage')
// })
app.use('/homePage', homePageRoute);
app.use('/admin', adminRoute);
app.use(function (req, res, next) {
  res.render('404', { layout: false });
});

app.use(function (err, req, res, next) {
  // console.error(err.stack);
  res.status(500).render('500', {
    stack: err.stack,
    layout: false
  });
});

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`E-commerce application listening at http://localhost:${PORT}`);
})