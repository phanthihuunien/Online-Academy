import express from 'express';
import userModel from "../services/user.model.js";
import UserModel from "../services/user.model.js";
const router = express.Router();
router.get('/manageStudent', async function(req, res) {

    const limit = 5;
    const curPage = req.query.page || 1;
    const offset = (curPage - 1) * limit;
    const studentList = await userModel.findPageByType(3, limit, offset);

    const total = await UserModel.countByUserType(3);
    const nPages = Math.ceil(total / limit);

    const pageNumbers = [];
    for (let i = 1; i <= nPages; i++) {
        let nextPg = i + 1;
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

    res.render('vwAdmin/user/instructorList',{


    });
})
router.get('/manageCourse', async function(req, res) {

    res.render('vwAdmin/course/courseList',{


    });
})
export default router;