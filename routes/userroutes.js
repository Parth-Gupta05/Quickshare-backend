import { Router } from "express";
import { DeleteUser, Login, Logout, SignUp } from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router=new Router()

router.post("/login",async (req,res)=>{
    const {email, password}=req.body
    const token=await Login(email,password)
    if (token) {
        res.cookie("token",token,{
                    httpOnly: true,
                    secure: true, // true in production with HTTPS
                    sameSite: "None", // or "None" if needed for cross-site
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
        res.status(200).send("Logged In")
    } else {
        
            res.status(400).send("Either Email or Password is wrong")
    }
})
router.post("/signup",SignUp)
router.post("/deleteuser",auth,DeleteUser)
router.post("/logout",auth,Logout)

export default router