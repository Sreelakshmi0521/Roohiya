
const nodemailer=require("nodemailer")
const env=require("dotenv").config({quiet:true})

async function sendVerificationEmail(email,otp,context="signup") {
    try {
        const transporter=nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
           
        })
        let subject, text, html

        switch(context) {
            case "signup":
                subject = "Verify your account"
                text = `Your OTP is ${otp}`
                html = `<b>Your OTP: ${otp}</b>`
                break

            case "emailChange":
                subject = "Verify Your New Email Address"
                text = `Your OTP for email change is ${otp}`
                html = `<b>Your OTP for email change is ${otp}</b>`
                break

            case "forgot":
                subject = "Reset Your Password"
                text = `Your OTP for password reset is ${otp}`
                html = `<b>Your OTP for password reset: ${otp}</b>`
                break

            default:
                subject = "Verify your account"
                text = `Your OTP is ${otp}`
                html = `<b>Your OTP: ${otp}</b>`
        }

        const emailInfo=await transporter.sendMail({

            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:subject,
            text:text,
            html:html,
        })
        return emailInfo.accepted.length>0
        
    } catch (error) {
         console.error("Email sending failed", error)
        return false

    }
    
}

module.exports={sendVerificationEmail}