import express from 'express';
import { engine } from 'express-handlebars';
import hbs_sections from 'express-handlebars-sections'
import numeral from 'numeral';

import categoryService from '../services/category.service.js';
import fieldService from '../services/field.service.js';
import courseService from '../services/course.service.js';
import chapterService from '../services/chapter.service.js';
import lessonService from '../services/lesson.service.js';
import multer from 'multer';
import moment from 'moment';

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
    },
	is_equal(val1, val2){
		return val1 === val2;
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
		  let catergories = await catService.findAllByFieldId(field.ID_FIELD);
		  
		  temp.field = field;
		  temp.catergories = catergories;
		  list.push(temp);
	  });
   res.locals.lcField_Categories = list;

    next();
  });
  
  app.post('/course/edit', async function (req, res) {
	 const id = req.query.id || 0;
	 let course = await courseService.findById(id);
	 const user = req.session.authUser;
	 if(user.type == 3 || user.ID_USER == course.ID_USER){
		 
		 // save image with courseID
		const storage = multer.diskStorage({
			destination: function (req, file, cb) {
			cb(null, './public/imgs');
			},
			filename: function (req, file, cb) {
			cb(null, courseId + "_thumbnail.png");
			}
		});

		const upload = multer({ storage: storage });
	  
		upload.array('fuMain', 1)(req, res, function (err) {
			if (err) {
				console.error(err);
			} else {		
				//update Course
				let data = req.body;
				let course_update={
					id = id,
					ID_FIELD = data.Field,
					ID_CATE = data.Cat,
					ID_USER = course.ID_USER,
					COURSENAME = data.CourseName,
					LENGTHS = course.LENGTHS,
					CREATEDATE = course.CREATEDATE, 
					LATUPDATE = moment().format('YYYY-MM-DD'),
					PRICE = data.Price,
					VIEWED = course.VIEWED,
					DESCRIPTIONS = data.FullDes,
					DISCOUNT = course.DISCOUNT,
					SHORTDES = data.ShortDes,
					RATENUM = course.RATENUM,
					STUNUM = course.STUNUM;,
				}
				
				await courseService.patch(course_update);
				
				//delete chapter and lesson
				const chaplist = await chapterService.findAllByCourseID(id);
				chaplist.forEach(chap=>{
					let lessonlist = await lessonService.findAllByChapterId(chap.ID_CHAPTER);
					lessonlist.forEach(lesson => {
						await lessonService.del(lesson.ID_LESSON);
					})
					await chapterService.del(chap.ID_CHAPTER);
				})
				
				//re-insert chapter and lesson
				let chapters = req.body.chapter
				chapters.forEach(chap =>{
					// insert chap.name, courseID to db, return chapID
					if(chap){
						let chapInsert = {}
						chapInsert.ID_COURSE = id;
						chapInsert.CHAPTERNAME = chap.name;
						let chapId = await chapterService.add(chapInsert);
						
						let i = 0;
						chap.lessonName.forEach(name=>{
							// insert name, chap.lessonUrl[i] to db
							
							let lesInsert = {};
							lesInsert.ID_CHAPTER = chapId;
							lesInsert.LESSONNAME = name;
							lesInsert.URL = chap.lessonUrl[i];
							lesInsert.REVIEW = 0;
							
							await lessonService.add(lesInsert);
							i++;
							
						});
					}
					
				});
			
				return res.redirect('/account/mycourse/');
			}

		})
		 
		 
		 
		
	 }
	 
	return res.redirect(req.originalUrl);
});
  
app.get('/course/edit',async function (req, res) {
	 const id = req.query.id || 0;
	 let course = await courseService.findById(id);
	
	 const user = req.session.authUser;
	 if(user.type == 3 || user.ID_USER == course.ID_USER){
		let list = [];
		let chapList = await chapterService.findAllByCourseID(id);
		chaplist.forEach(chap => {
			let lessonlist = await lessonService.findAllByChapterId(chap.ID_CHAPTER); 
			let temp ={
				 chapter: chap,
				 lessons: lessonlist,
			};
			list.push(temp);
		});
		return res.render('vwCourse/editCourse',
		  {
			  course: course,
			  data: list,
			  curcounter: chapList.length + 1;
		  }
		);
	 }
	 
	return res.redirect(req.originalUrl);
});

app.get('/course/create', function (req, res) {
  return res.render('vwCourse/createCourse');
});

app.post('/course/create', function (req, res) {
	// insert course, return courseID
	const data = req.body;
	let course={
		ID_FIELD = data.Field,
		ID_CATE = data.Cat,
		ID_USER = req.session.authUser.ID_USER,
		COURSENAME = data.CourseName,
		LENGTHS = 0,
		CREATEDATE = moment().format('YYYY-MM-DD'), 
		LATUPDATE = moment().format('YYYY-MM-DD'),
		PRICE = data.Price,
		VIEWED = 0,
		DESCRIPTIONS = data.FullDes,
		DISCOUNT = 0,
		SHORTDES = data.ShortDes,
		RATENUM = 0,
		STUNUM = 0,
	}
		
	const courseId = await courseService.add(course);
	const chapters = req.body.chapter;
	chapters.forEach(chap =>{
		// insert chap.name, courseID to db, return chapID
		if(chap){
			let chapInsert = {
				ID_COURSE = courseId;
				CHAPTERNAME = chap.name;
			}
			
			let chapId = await chapterService.add(chapInsert);
			
			let i = 0;
			chap.lessonName.forEach(name=>{
				// insert name, chap.lessonUrl[i] to db
				
				let lesInsert = {
					ID_CHAPTER = chapId;
					LESSONNAME = name;
					URL = chap.lessonUrl[i];
					REVIEW = 0;	
				};
				
				
				await lessonService.add(lesInsert);
				i++;
				
			});
		}
		
	});
		
	// save image with courseID
	const storage = multer.diskStorage({
		destination: function (req, file, cb) {
		cb(null, './public/imgs');
		},
		filename: function (req, file, cb) {
		cb(null, courseId + "_thumbnail.png");
		}
	});

	const upload = multer({ storage: storage });
  
	upload.array('fuMain', 1)(req, res, function (err) {
		if (err) {
			console.error(err);
		} else {		
			return res.redirect('/account/mycourse/');
		}

	})
	
	
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