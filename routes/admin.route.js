import express from 'express';
import userModel from "../services/user.model.js";
import fieldModel from "../services/field.model.js";
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
    console.log(+curPage === 1)
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
    console.log(+curPage === 1)
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

    res.render('vwAdmin/course/courseList',{


    });
})

router.get('/manageField', async function(req, res) {
    const limit3 = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit3;
    const fieldList = await fieldModel.findPageOfField(limit3, offset);
    const total = await fieldModel.countByAllField();
    const nPages = Math.ceil(total / limit3);
console.log("++++++++++++" + fieldList)
    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        pageNumbers.push({
            value: i,
            isCurrent: i === +curPage
        });
    }
    console.log(+curPage === 1)
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
router.get('/field/confirmDlt', async function(req, res) {

    res.render('vwAdmin/field/deleteConfirm',{

    });
})
export default router;