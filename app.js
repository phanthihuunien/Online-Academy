import express from "express";
import { engine } from "express-handlebars";
import hbs_sections from "express-handlebars-sections";
import numeral from "numeral";
import bodyParser from "body-parser";

import catService from "./services/category.service.js";
import fieldService from "./services/field.service.js";
import courseService from "./services/course.service.js";
import chapterService from "./services/chapter.service.js";
import lessonService from "./services/lesson.service.js";
import multer from "multer";
import moment from "moment";
import session from "express-session";
import fnKnexStore from "connect-session-knex";

import db from "./utils/db.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );
app.use("/public", express.static("public"));

app.engine(
  "hbs",
  engine({
    // defaultLayout: 'main.hbs'
    extname: "hbs",
    defaultLayout: "main",
    helpers: {
      section: hbs_sections(),
      format_number(val) {
        return numeral(val).format("0,0");
      },
      if_equal(val1, val2, options) {
        return val1 == val2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", "./views");

const KnexStore = fnKnexStore(session);
const store = new KnexStore({ knex: db });

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      // secure: true
    },
  })
);

app.use(async function (req, res, next) {
  if (typeof req.session.auth === "undefined") {
    req.session.auth = false;
  }

  res.locals.auth = req.session.auth;
  res.locals.authUser = req.session.authUser;
  next();
});

app.use(async function (req, res, next) {
  let list = [];

  let fields = await fieldService.findAll();

  const promises = fields.map(async (field) => {
    const cat = await catService.findAllByFieldId(field.ID_FIELD);
    return cat;
  });

  const catsArr = await Promise.all(promises);

  let i = 0;
  fields.forEach((field) => {
    let temp = {
      field: field,
      categories: catsArr[i],
    };
    list.push(temp);
    i++;
  });
  console.log(list);
  res.locals.lcField_Categories = list;

  next();
});

app.post("/course/edit", async function (req, res) {
  const id = req.query.id || 0;
  let course = await courseService.findById(id);
  //   const user = req.session.authUser;
  const user = { TYPE: 3 };
  if (user.TYPE == 3 || user.ID_USER == course.ID_USER) {
    //delete chapter and lesson
    const chaplist = await chapterService.findAllByCourseId(id);

    for (let chap of chaplist) {
      let lessonlist = await lessonService.findAllByChapterId(chap.ID_CHAPTER);
      for (let les of lessonlist) {
        await lessonService.del(les.ID_LESSON);
      }
      await chapterService.del(chap.ID_CHAPTER);
    }

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/imgs/course");
      },
      filename: function (req, file, cb) {
        if (file.fieldname === "fuThumbnail") {
          cb(null, id + "_thumbnail.png");
        }
        if (file.fieldname === "fuMain") {
          cb(null, id + "_main.png");
        }
      },
    });

    const upload = multer({ storage: storage }).fields([
      {
        name: "fuMain",
        maxCount: 1,
      },
      {
        name: "fuThumbnail",
        maxCount: 1,
      },
    ]);

    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
      } else {
        //update Course
        let data = req.body;
        let course_update = {
          id: id,
          ID_FIELD: data.Field,
          ID_CATE: data.Cat,
          ID_USER: course.ID_USER,
          COURSENAME: data.CourseName,
          LENGTHS: course.LENGTHS,
          CREATEDATE: course.CREATEDATE,
          LASTUPDATE: moment().format("YYYY-MM-DD"),
          PRICE: data.Price,
          VIEWED: course.VIEWED,
          DESCRIPTIONS: data.FullDes,
          DISCOUNT: course.DISCOUNT,
          SHORTDES: data.ShortDes,
          RATENUM: course.RATENUM,
          STUNUM: course.STUNUM,
        };

        await courseService.patch(course_update);
        //re-insert chapter and lesson
        const chapters = JSON.parse(JSON.stringify(req.body.chapter));
        for (let chap of chapters) {
          if (chap) {
            let chapInsert = {
              ID_COURSE: id,
              CHAPTERNAME: chap.name,
            };
            let chapId = await chapterService.add(chapInsert);

            let i = 0;
            if (chap.lessonName) {
              for (let name of chap.lessonName) {
                console.log("lesson name", name);
                let lesInsert = {
                  ID_CHAPTER: chapId,
                  LESSONNAME: name,
                  URL: chap.lessonUrl[i],
                  REVIEW: 0,
                };

                await lessonService.add(lesInsert);

                i++;
              }
            }
          }
        }

        return res.redirect("/account/mycourse/");
      }
    });
  }

  return res.redirect(req.originalUrl);
});

app.get("/course/edit", async function (req, res) {
  const id = req.query.id || 0;
  let course = await courseService.findById(id);
  let curCatList = await catService.findAllByFieldId(course.ID_FIELD);
  const user = req.session.authUser;
  if (user.type == 3 || user.ID_USER == course.ID_USER) {
    let list = [];
    let chapList = await chapterService.findAllByCourseID(id);
    for (let chap of chaplist) {
      let lessonlist = await lessonService.findAllByChapterId(chap.ID_CHAPTER);

      let temp = {
        chapter: chap,
        lessons: lessonlist,
      };
      list.push(temp);
    }
    return res.render("vwCourse/editCourse", {
      course: course,
      curCatList: curCatList,
      data: list,
      curcounter: chapList.length + 1,
    });
  }

  return res.redirect(req.headers.referer);
});

app.get("/course/create", function (req, res) {
  return res.render("vwCourse/createCourse");
});

app.post("/course/create", async function (req, res) {
  // insert course, return courseID
  const courseId = await courseService.add();

  if (typeof courseId === "undefined") return res.redirect("/course/create");

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/imgs/course");
    },
    filename: function (req, file, cb) {
      if (file.fieldname === "fuThumbnail") {
        cb(null, id + "_thumbnail.png");
      }
      if (file.fieldname === "fuMain") {
        cb(null, id + "_main.png");
      }
    },
  });

  const upload = multer({ storage: storage }).fields([
    {
      name: "fuMain",
      maxCount: 1,
    },
    {
      name: "fuThumbnail",
      maxCount: 1,
    },
  ]);
  

  upload(req, res, async function (err) {
    if (err) {
      console.error(err);
    } else {
      const data = req.body;
      let course = {
        id: courseId,
        ID_FIELD: +data.Field,
        ID_CATE: +data.Cat,
        // ID_USER: req.session.authUser.ID_USER,
        ID_USER: 1,

        COURSENAME: data.CourseName,
        LENGTHS: 100,
        CREATEDATE: moment().format("YYYY-MM-DD"),
        LASTUPDATE: moment().format("YYYY-MM-DD"),
        PRICE: data.Price,
        VIEWED: 0,
        DESCRIPTIONS: data.FullDes,
        DISCOUNT: 0,
        SHORTDES: data.ShortDes,
        RATENUM: 0,
        STUNUM: 0,
      };
      await courseService.patch(course);

      const chapters = JSON.parse(JSON.stringify(req.body.chapter));

      for (let chap of chapters) {
        if (chap) {
          let chapInsert = {
            ID_COURSE: courseId,
            CHAPTERNAME: chap.name,
          };
          let chapId = await chapterService.add(chapInsert);

          let i = 0;
          if (chap.lessonName) {
            for (let name of chap.lessonName) {
              console.log("lesson name", name);
              let lesInsert = {
                ID_CHAPTER: chapId,
                LESSONNAME: name,
                URL: chap.lessonUrl[i],
                REVIEW: 0,
              };

              await lessonService.add(lesInsert);

              i++;
            }
          }
        }
      }
    }
  });

  return res.redirect("/account/mycourse/");

  // save image with courseID
});

app.get("/", function (req, res) {
  // res.send('Hello World.');
  res.render("home");
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.use(function (req, res, next) {
  res.render("404", { layout: false });
});

app.use(function (err, req, res, next) {
  // console.error(err.stack);
  res.status(500).render("500", {
    stack: err.stack,
    layout: false,
  });
});

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`E-commerce application listening at http://localhost:${PORT}`);
});
