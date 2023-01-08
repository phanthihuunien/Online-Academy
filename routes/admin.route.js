import express, {request} from 'express';
import userModel from "../services/user.model.js";
import fieldModel from "../services/field.model.js";
import categoryModel from "../services/category.model.js";
import courseModel from "../services/course.model.js";
import userCourseModel from "../services/user-course.model.js";
import CourseModel from "../services/course.model.js";
const router = express.Router();
router.get('/manageStudent', async function(req, res) {

    const limit = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const studentList = await userModel.findPageByType(3, limit, offset);

    const total = await userModel.countByUserType(3);
    const nPages = Math.ceil(total / limit);

    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +curPage
        });
    }

    res.render('vwAdmin/user/studentList',{
        students: studentList,
        empty: studentList.length === 0,
        pageNumbers: pageNumbers,
        next: +curPage + 1,
        isNotEnd: +curPage !== +nPages,
        prev:+curPage - 1,
        hasNotPrev: +curPage === 1,
    });

})
router.get('/manageInstructor', async function(req, res) {
    const limit2 = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit2;
    const studentList = await userModel.findPageByType(2, limit2, offset);

    const total = await userModel.countByUserType(2);
    const nPages = Math.ceil(total / limit2);

    const pageNumbers2 = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers2.push({
            value: i,
            isCurrent: i === +curPage
        });
    }

    res.render('vwAdmin/user/studentList',{
        students: studentList,
        empty: studentList.length === 0,
        pageNumbers: pageNumbers2,
        next: +curPage + 1,
        isNotEnd: +curPage !== +nPages,
        prev:+curPage - 1,
        hasNotPrev: +curPage === 1,
    });
})
router.get('/manageCourse', async function(req, res) {
    const limit = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const courseList = await CourseModel.findPageOfCourse(limit, offset);

    const total = await CourseModel.countByAllCourse();
    const nPages = Math.ceil(total / limit);

    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +curPage
        });
    }

    const courses = [];
    for (let course of courseList) {
        let instructor = await userModel.getCourseFromUser(course.ID_USER);
        let rate= await userCourseModel.getAvgRateByCourseId(course.ID_COURSE);
        let courseRate = null;
        if(rate === null){
            courseRate = 0;
        }else{
            courseRate = parseFloat(rate).toFixed(1);
        }

        const newCourse = await courseModel.newCourse();
        let newC;
        for(let c of newCourse){
            if(course.LASTUPDATE >= c.LASTUPDATE){
                console.log(course.LASTUPDATE === c.LASTUPDATE)
                newC = 1;
                break;
            }
            newC = 0;
        }
        const listPplCourse = await courseModel.mostPopular();
        let bestSeller;
        for(let c of listPplCourse){
            if(course.STUNUM >= c.STUNUM){
                bestSeller = 1;
                break;
            }
            bestSeller = 0;
        }
        let realPrice = 0;
        let isDiscount = true;
        if (isNaN(parseInt(course.DISCOUNT)) || parseInt(course.DISCOUNT) === 0) {
            realPrice = course.PRICE;
            isDiscount = false;
        } else {
            let price = +course.PRICE,
                sale = +course.DISCOUNT;
            realPrice = price - (price * sale) / 100;
        }
        courses.push({
            course,
            instructor,
            courseRate,
            bestSeller,
            newC,
            realPrice,
        });
    }
    res.render('vwAdmin/course/courseList',{
        courseList:courses,
        empty: courses.length === 0,
        pageNumbers: pageNumbers,
        next: +curPage + 1,
        isNotEnd: +curPage !== +nPages,
        prev:+curPage - 1,
        hasNotPrev: +curPage === 1,
    });
})

router.get('/manageField', async function(req, res) {
    const limit3 = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit3;
    const fieldList = await fieldModel.findPageOfField(limit3, offset);
    const total = await fieldModel.countByAllField();
    const nPages = Math.ceil(total / limit3);

    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +curPage
        });
    }

    res.render('vwAdmin/field/fieldManage',{
        fields: fieldList,
        empty: fieldList.length === 0,
        pageNumbers: pageNumbers,
        next: +curPage + 1,
        isNotEnd: +curPage !== +nPages,
        prev:+curPage - 1,
        hasNotPrev: +curPage === 1,
    });

})
router.get('/field/add', async function(req, res) {

    res.render('vwAdmin/field/addField',{

    });
})

router.post("/field/add", async function (req, res) {
    const ret = await fieldModel.add(req.body);
    res.redirect("/admin/manageField");
});


router.post("field/delete", async function (req, res) {
    const cat = await categoryModel.getAllCatByFieldID(req.body.ID_FIELD);
    if (cat.length === 0) {
        const ret = await fieldModel.del(req.body);
        res.redirect("/admin/manageField");
    }
    res.render("admin/manageField", {
        err_message: "Can not delete field that still has courses!!!",
    });
});
router.get("/field/edit/:id", async function (req, res) {
    const id = request.params.id || 0;
    const name = await fieldModel.getFieldNameById(id);
    res.render("vwAdmin/field/editField", {
        fieldName:name,
    });
});
router.post("/field/edit/:id", async function (req, res) {
    const id = request.params.id || 0;
    const ret = await fieldModel.patch(req.body, id);

    res.redirect("/admin/manageField");
});


router.get('/manageCat', async function(req, res) {
    const limit3 = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit3;
    const catList = await categoryModel.findPageOfCat(limit3, offset);
    const total = await categoryModel.countByAllCat();
    const nPages = Math.ceil(total / limit3);
    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +curPage
        });
    }
    res.render('vwAdmin/category/catManage',{
        cate: catList,
        empty: catList.length === 0,
        pageNumbers: pageNumbers,
        next: +curPage + 1,
        isNotEnd: +curPage !== +nPages,
        prev:+curPage - 1,
        hasNotPrev: +curPage === 1,
    });

})
router.get('/category/add', async function(req, res) {
    const fieldList = await fieldModel.getAllField();
    console.log(fieldList);
    res.render('vwAdmin/category/addCat',{
        fields: fieldList,
    });
})

router.post("/category/add", async function (req, res) {
    const ret = await categoryModel.add(req.body);
    res.redirect("/admin/manageCat");
});


router.post("/category/delete", async function (req, res) {
    //check if del cat has had courses=> prevent del
    const courses = await courseModel.getAllCourseByCatID(req.body.ID_CATE);
    if (courses.length === 0) {
        const ret = await categoryModel.del(req.body);
        res.redirect("/admin/manageCat");
    }
    res.render("admin/manageCat", {
        err_message: "Can not delete field that still has courses!!!",
    });
});

export default router;