import express from 'express';


import bcrypt from 'bcrypt';
import userModel from '../models/user.model.js'





const router = express.Router();
router.get("/profile",  async function (req, res) {  // phai co Auth
   // const userdata = req.session.loggedinUser;
    const user = await userModel.findbyID(1);
    res.render("vwAccount/profile", {
        user,
    });
});

router.post("/profile", async function (req, res) {
    try {
        //get data from user input
        const hashedPass = bcrypt.hashSync(req.body.PASSWORD, 10);


        const newUser = {
            ID_USER: req.body.ID_USER,
            USERNAME: req.body.USERNAME,
            PASSWORD: hashedPass,
            DOB: convertedDOB,
            FULLNAME: req.body.FULLNAME,
            EMAIL: req.body.EMAIL,
            TYPE: 1,
            PROFILE: req.body.PROFILE,
        };

        //get user password in db to compare
        const user = await userModel.findbyID(newUser.ID_USER);

        const ret = bcrypt.compareSync(req.body.OldPassword, user.PASSWORD);
        //if old password match
        if (ret) {
            //update db data
            await userModel.update(newUser);

            //rerender view
            res.render("vwAccount/profile", {
                userdata: newUser,
                err_message: "Update Successfull!!!",
            });
        } else {
            res.render("vwAccount/profile", {
                // userdata: req.session.loggedinUser,  sesson cua log in , đợi có hàm log in
                err_message: "Wrong password, please type again!!!",
            });
        }
    } catch (error) {
        res.render("vwAccount/profile", {
          //  userdata: req.session.loggedinUser, như trên
            err_message: "Somethings wrong, please check again!!!",
        });
    }
});

export default router;