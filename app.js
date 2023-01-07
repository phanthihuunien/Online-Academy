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
  if (fields != null) {
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
  }

  res.locals.lcField_Categories = list;

  next();
});

app.post("/lesson/save", async function (req, res) {
  const lesId = req.query.lessonId;
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/videos");
    },
    filename: async function (req, file, cb) {
      let t = {
        id: lesId,
        URL: file.originalname,
      };
      await lessonService.patch(t);
      cb(null, lesId + ".png");
    },
  });

  const upload = multer({ storage: storage }).single("fuLesson");

  upload(req, res, async function (err) {
    if (err) {
      console.error(err);
    } else {
      return;
    }
  });
  return;
});

app.get("/chapter/create", async function (req, res) {
  const courseid = req.query.courseId;
  console.log("course id", courseid);

  let t = {
    ID_COURSE: courseid,
    CHAPTERNAME: "TEMP",
  };
  let num = await chapterService.add(t);

  return res.json(num);
});

app.get("/chapter/del", async function (req, res) {
  const chapId = req.query.chapterId;
  console.log("chapter: ", chapId);
  await chapterService.del(chapId);

  return res.json(true);
});
app.get("/lesson/create", async function (req, res) {
  const chapId = req.query.chapId;
  console.log("chapter id", chapId);
  let t = {
    ID_CHAPTER: chapId,
    LESSONNAME: "TEMP",
    URL: "",
    REVIEW: 0,
  };
  let num = await lessonService.add(t);

  return res.json(num);
});
app.get("/lesson/del", async function (req, res) {
  const lesId = req.query.lessonId;
  console.log(lesId)
  await lessonService.del(lesId);
  return res.json(true);
});

app.post("/course/del", async function (req, res) {
  const id = req.query.id || 0;
  let course = await courseService.findById(id);

  if (course == null) {
    return res.redirect(req.headers.referer ? req.headers.referer : "/");
  }

  //   const user = req.session.authUser;
  const user = { TYPE: 3, ID_USER: 1 };

  if (user.TYPE == 3 || user.ID_USER == course.ID_USER) {
    //delete chapter and lesson
    const chaplist = await chapterService.findAllByCourseId(id);
    if (chaplist != null) {
      for (let chap of chaplist) {
        await chapterService.del(chap.ID_CHAPTER);

        let lessonlist = await lessonService.findAllByChapterId(
          chap.ID_CHAPTER
        );
        if (lessonlist != null) {
          for (let les of lessonlist) {
            await lessonService.del(les.ID_LESSON);
          }
        }
      }
    }

    await courseService.del(id);

    return res.redirect("/account/mycourse/");
  }
});

app.post("/course/edit", async function (req, res) {
  const id = req.query.id || 0;
  let course = await courseService.findById(id);

  if (course == null) {
    return res.redirect(req.headers.referer ? req.headers.referer : "/");
  }
  //   const user = req.session.authUser;
  const user = { TYPE: 2, ID_USER: 1 };

  if (user.TYPE == 2 && user.ID_USER == course.ID_USER) {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./public/imgs/course");
      },
      filename: async function (req, file, cb) {
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
          id: id,
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
          let i = 0;

          if (chap) {
            let chapInsert = {
              id: chap.id,
              ID_COURSE: id,
              CHAPTERNAME: chap.name,
            };
            await chapterService.patch(chapInsert);

            if (chap.lessonName) {
              for (let name of chap.lessonName) {
                console.log("lesson name", name);

                let lesInsert = {
                  id: chap.lessonId[i],
                  ID_CHAPTER: chap.id,
                  LESSONNAME: name,
                  REVIEW: 0,
                };
                await lessonService.patch(lesInsert);

                i++;
              }
            }
          }
        }
      }
    });

    return res.redirect("/account/mycourse/");
  }

  return res.redirect(req.headers.referer ? req.headers.referer : "/");
});

app.get("/course/edit", async function (req, res) {
  const id = req.query.id || 0;
  let course = await courseService.findById(id);

  if (course == null) {
    return res.redirect(req.headers.referer ? req.headers.referer : "/");
  }

  let curCat = await catService.findById(course.ID_CATE);
  let curField = await fieldService.findById(curCat.ID_FIELD);

  let curCatList = await catService.findAllByFieldId(course.ID_FIELD);

  // const user = req.session.authUser;
  const user = { TYPE: 2, ID_USER: 1 };

  if (user.TYPE == 2 && user.ID_USER == course.ID_USER) {
    let list = [];
    let chapList = await chapterService.findAllByCourseId(id);
    if (chapList != null) {
      for (let chap of chapList) {
        let lessonlist = await lessonService.findAllByChapterId(
          chap.ID_CHAPTER
        );
        let temp = {
          chapter: chap,
          lessons: lessonlist,
        };
        list.push(temp);
      }
    }

    return res.render("vwCourse/editCourse", {
      course: course,
      curField: curField,
      curCatList: curCatList,
      data: list,
      curcounter: chapList == null ? 0 : chapList.length + 1,
    });
  }

  return res.redirect(req.headers.referer);
});

app.get("/course/create", function (req, res) {
  // const user = req.session.authUser;
  const user = { TYPE: 2, ID_USER: 1 };

  if (user.TYPE == 2) {
    return res.render("vwCourse/createCourse");
  }

  return redirect("/");
});

app.post("/course/create", async function (req, res) {
  // const user = req.session.authUser;
  const user = { TYPE: 2, ID_USER: 1 };

  if (user.TYPE != 2) {
    return redirect("/");
  }

  // insert course, return courseID
  const courseId = await courseService.add();

  if (typeof courseId === "undefined") return res.redirect("/course/create");

  let ledIdList = [];
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === "fuLesson") {
        cb(null, "./public/videos");
      } else {
        cb(null, "./public/imgs/course");
      }
    },
    filename: async function (req, file, cb) {
      if (file.fieldname === "fuThumbnail") {
        4;
        cb(null, courseId + "_thumbnail.png");
      }
      if (file.fieldname === "fuMain") {
        cb(null, courseId + "_main.png");
      }
      if (file.fieldname === "fuLesson") {
        let lesId = await lessonService.add({
          ID_CHAPTER: 1,
          LESSONNAME: "TEMP",
          URL: file.originalname,
          REVIEW: 0,
        });
        ledIdList.push(lesId);
        cb(null, lesId + ".png");
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
    {
      name: "fuLesson",
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
        ID_USER: user.ID_USER,

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
      let i = 0;

      for (let chap of chapters) {
        if (chap) {
          let chapInsert = {
            ID_COURSE: courseId,
            CHAPTERNAME: chap.name,
          };
          let chapId = await chapterService.add(chapInsert);

          if (chap.lessonName) {
            for (let name of chap.lessonName) {
              console.log("lesson name", name);

              let lesInsert = {
                id: ledIdList[i],
                ID_CHAPTER: chapId,
                LESSONNAME: name,
                REVIEW: 0,
              };
              await lessonService.patch(lesInsert);

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
