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
import "./models/User.js"
import "passport"
const Category = mongoose.model("categories")
const Post = mongoose.model("posts")

import configurePassport from "./config/auth.js" 


import { router } from "./routes/admin.js"
import { routerUser } from "./routes/user.js"
import * as path from "path"
import passport from "passport"

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

    app.use(passport.initialize())
    app.use(passport.session())
    

    app.use(flash())
    
    //Middleware
    configurePassport(passport)
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
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



app.get("/post/:slug", (req, res) => {
    Post.findOne({slug: req.params.slug}).lean().then((post) => {
        if (post) {
            res.render("post/index", {post})
        } else {
            req.flash("error_msg", "This post does not exists")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Internal error")
        res.redirect("/")
    })
})

app.get("/categories", (req, res) => {
    Category.find().lean().then( (categories) => {
        res.render("categories/index", {categories})
    }).catch((err) => {
        req.flash("error_msg", "Internal error")
        res.redirect("/")
    })
})

app.get("/categories/:slug", (req, res) => {
    Category.findOne({slug: req.params.slug}).lean().then((category) => {
        if (category) {
            Post.find({category: category._id}).lean().then((posts) => {
                res.render("categories/posts", {posts, category})
            })
        } else {
            req.flash("error_msg", "Internal error - Categories")
            res.redirect("/categories")
        }
    }).catch((err) => {
        req.flash("error_msg", "Internal error - Categories")
        res.redirect("/")
    })
})

app.use("/users", routerUser)


// Others
const PORT = process.env.PORT ?? 3333
app.listen({
    host: "0.0.0.0",
    port: PORT
}, () => {
    console.log("server running on port:", PORT)
})
