import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { User } from "../models/user.model.js"

const Login=async (email, password)=>{
    try {
    
        const founduser=await User.findOne(
            {email:email}
        )
        console.log(founduser)
        if(!founduser) return false
    
        if(await bcrypt.compare(password,founduser.password)){
            const token =await jwt.sign({email, username:founduser.userName},process.env.JWT_SECRET_KEY)
            console.log(token)
            return token
    
        }
        else{
            console.log("Password Doesnt match")
            
            return false
        }
    
    
    } catch (error) {
        console.log("Login"+error)
        
    }
    
}

const SignUp=async (req,res)=>{
    const {email,password,userName}=req.body
    const hashpass=await bcrypt.hash(password,10)

    const existinguser=await User.find({email})

    if(existinguser.length>0){
        return res.status(300).send("User with this email exists try another or Login")
    }
        try {
            
                const userCreated=await User.create({
                    userName,
                    email,
                    password:hashpass
                })
                await userCreated.save()
                
                const token = await Login(email, password)
                if (token) {
        res.cookie("token",token,{
                    httpOnly: true,
                    secure: true, // true in production with HTTPS
                    sameSite: "None", // or "None" if needed for cross-site
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
        res.status(200).send("User created and Logged In")
    } else {
        
            res.status(200).send("User Created but Login Failed")
    }
        } catch (error) {
            console.log("SignUp Error"+error)
            return res.status(500).send("Internal Server Error")
        }
}

const DeleteUser=async (req, res)=>{
    // const {email}=req.body
    const token=req.cookies.token
    const verifieduser=jwt.verify(token,process.env.JWT_SECRET_KEY)
    const {email}=verifieduser
    try {
        const deleteduser=await User.findOneAndDelete({email})
        return res.status(200).send("User Deleted")
    } catch (error) {
        console.log("Deleteuser"+error)
        return res.status(500).send("Internal Server Error")
    }
}

const Logout = async (req, res) => {
try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,       // set to true if using HTTPS
        sameSite: "None",   // or "strict" / "lax" based on your setup
      });
      res.status(200).json({ message: "Logged out successfully" });
} catch (error) {
    res.status(500).send("Internal server error")
}
};

export {Login, SignUp, DeleteUser, Logout}