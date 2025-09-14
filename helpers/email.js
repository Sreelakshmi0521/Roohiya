
const nodemailer=require("nodemailer")
const env=require("dotenv").config({quiet:true})

async function sendVerificationEmail(email,otp) {
    try {
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
           
        })
        const emailInfo=await transporter.sendMail({

            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b> Your OTP: ${otp}</b>`
        })
        return emailInfo.accepted.length>0
        
    } catch (error) {
         console.error("Email sending failed", error);
        return false;

    }
    
}

module.exports={sendVerificationEmail}