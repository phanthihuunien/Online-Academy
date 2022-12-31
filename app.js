import express from 'express';
import { engine } from 'express-handlebars';
import hbs_sections from 'express-handlebars-sections'
import numeral from 'numeral';

import categoryService from '../services/category.service.js';
import fieldService from '../services/field.service.js';

const app = express();
app.use(express.urlencoded({
  extended: true
}));
app.use('/public', express.static('public'));

app.engine('hbs', engine({
  // defaultLayout: 'main.hbs'
  extname: 'hbs',
  defaultLayout: 'main',
  helpers: {
    section: hbs_sections(),
    format_number(val) {
      return numeral(val).format('0,0');
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', './views');



app.use(async function (req, res, next) {
    if (typeof req.session.auth === 'undefined') {
      req.session.auth = false;
    }

    res.locals.auth = req.session.auth;
    res.locals.authUser = req.session.authUser;
    next();
  });

  app.use(async function (req, res, next) {
	  let list = [];
	  let temp = {};
	  
	  let fields = await fieldService.findAll();
	  fields.forEach(field => {
		  let catergories = await catService.findById(field.ID_FIELD);
		  
		  temp.field = field;
		  temp.catergories = catergories;
		  list.push(temp);
	  });
   res.locals.lcField_Categories = list;

    next();
  });

app.get('/course/create', function (req, res) {
  res.render('createCourse');
});

app.post('/course/create', function (req, res) {
	// insert course, return courseID
		
	// save image with courseID
			
	req.body.chapter.forEach(chap =>{
		// insert chap.name, courseID to db, return chapID
	
		let i = 0;
		chap.lessonName.forEach(name=>{
			// insert name, chap.lessonUrl[i] to db
			
		});
	});
  res.render('createCourse');
});

app.get('/', function (req, res) {
  // res.send('Hello World.');
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about');
})

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