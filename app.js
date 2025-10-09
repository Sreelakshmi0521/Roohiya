const express=require("express")
const app=express()
const env=require("dotenv").config({quiet:true})
const db=require("./config/db")
const path =require("path")
const session=require("express-session")
const nocache=require("nocache")
const userRoutes=require("./routes/user")
const adminRoutes=require("./routes/admin")
const passport=require("./config/passport")
const expressLayouts=require("express-ejs-layouts")
const methodOverride=require("method-override")



app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname,"public")))
app.use("/admin",expressLayouts)
app.set('layout', 'layouts/mainLayout');





app.use(session({
    secret: process.env.SESSION_SECRET,
   resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, 
    secure: false,
     httpOnly:true
} 
}));  
app.use(nocache()); 

app.use(passport.initialize())
app.use(passport.session())

app.use(methodOverride("_method"))

app.get("/", (req, res) => {
    res.render('landing', {
        user: req.session.user || null,
        pageTitle: "Roohiya - Adorn Your Soul with Timeless Beauty"
    });
});
app.use("/user",userRoutes)
app.use("/admin",adminRoutes)

db()
app.listen(process.env.PORT,()=>{
    console.log(`server is running`)
})