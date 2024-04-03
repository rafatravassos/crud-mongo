// Loading modules
import express from "express"
import {engine} from 'express-handlebars'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'
import "./database/mongo-connect.js"
import session from "express-session"
import flash from "connect-flash"
import mongoose from "mongoose"
import "./models/Category.js"
import "./models/Posts.js"
const Category = mongoose.model("categories")
const Post = mongoose.model("posts")


import { router } from "./routes/admin.js"
import * as path from "path"

const app = express()
const admin = router
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Setups
    //Sessions
    app.use(session({
        secret: "anything",
        resave: true,
        saveUninitialized: true,
    }))
    app.use(flash())
    
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })
    // Body Parser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())

    // Handlebars
    app.engine('handlebars', engine({ defaultLayout: 'main' }));  
    app.set('view engine', 'handlebars')

    // Mongoose

    // Public
    app.use(express.static(path.join(__dirname, "public")))

//Routes
    app.get('/', (req, res) => {
        Post.find({}).lean().populate("category").sort({date: 'desc'}).then((posts) => {
            res.render("index", {posts: posts})
        }).catch((err) => {
            req.flash("error_msg", "Error on listing posts: " + err)
            res.redirect("/404")
        })
    })

    app.use('/admin', admin)
    app.get("/404", (req, res) => {
        res.send("Error")
    })


// Others
const PORT = process.env.PORT ?? 3333
app.listen({
    host: "0.0.0.0",
    port: PORT
}, () => {
    console.log("server running on port:", PORT)
})





