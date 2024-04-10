import express, { application } from "express"
export const routerUser = express.Router()
import mongoose from "mongoose"
import "../models/User.js"
import bcrypt from "bcryptjs"
import { router } from "./admin.js"
const User = mongoose.model("users")
import "passport"
import passport from "passport"

routerUser.get("/register", (req, res) => {
    res.render("users/register")
})

routerUser.post("/register", (req, res) => {
    var errors=[]

    if(!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Invalid name"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        errors.push({text: "Invalid email " + req.body.email })
    }
    if(!req.body.password || typeof req.body.password == undefined || req.body.password == null) {
        errors.push({text: "Invalid password"})
    }
    if(req.body.password.length < 4) {
        errors.push({text: "Short password"})
    }
    if(req.body.password!=req.body.password2) {
        errors.push({text: "Different passwords"})
    }

    if (errors.length>0) {

        res.render("users/register", {errors: errors})

    } else {
        User.findOne({email: req.body.email}).lean().then((user) => {
            if (user) {
                req.flash("error_msg", "Ther is another account registered with this e-mail")
                res.redirect("/users/register")
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                })
                bcrypt.genSalt(10, (error, salt) => {
                    bcrypt.hash(newUser.password, salt, (error, hash) => {
                        if (error) {
                            req.flash("error_msg", "Error on saving user\n" + error)
                            res.redirect("/")
                        } else {
                            newUser.password = hash
                            newUser.save().then(()=> {
                                req.flash("success_msg", "User successfuly created")
                                res.redirect("/")
                            }).catch((error) => {
                                req.flash("error_msg", "Error on saving user\n" + error)
                                res.redirect("/users/register")
    
                            })
                        }
                    })
                })
            }
        }).catch((error) => {
            req.flash("error_msg", "Internal error\n" + error)
            res.redirect("/")

        })
    }


})

routerUser.get("/login", (req,res) => {
    res.render("users/login")
})

routerUser.post("/login", (req,res,next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
    
})
