import jwt from "jsonwebtoken"

export const auth=(req,res,next)=>{
    try {
        
        const token=req.cookies.token
        console.log(token)
    
        if(!token){
            return res.status(401).send("Token Not Found || Please Login!!")
        }
        
        const user=jwt.verify(token,process.env.JWT_SECRET_KEY)
    
        req.user=user
    
        next()
    
    } catch (error) {
        console.log("Auth Middleware"+error)
        res.status(401).send("Unauthorized Access")
    }
}