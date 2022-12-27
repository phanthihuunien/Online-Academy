import express from 'express';
import { engine } from 'express-handlebars';
import hbs_sections from 'express-handlebars-sections'


import numeral from 'numeral';

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

// app.use(async function (req, res, next) {
//   res.locals.lcCategories = await categoryService.findAllWithDetails();
//   next();
// });

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