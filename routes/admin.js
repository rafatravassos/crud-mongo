import express from "express"
export const router = express.Router()
import mongoose from "mongoose"
import "../models/Category.js"
import "../models/Posts.js"
const Category = mongoose.model("categories")
const Post = mongoose.model("posts")

router.get('/categories', (req, res) => {
    Category.find({}).lean().sort({date: 'desc'}).then((categories) => {
        res.render("admin/categories", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "Error on listing categories: " + err)
    })
})

router.get('/categories/add', (req, res) => {
    res.render("admin/addcategories")
})

router.post('/categories/new', (req, res) => {
    var errors = []
    if (!req.body.name || typeof req.body.name == undefined || req.body.name == null) {
        errors.push({text: "Invalid name"})
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        errors.push({text: "Invalid slug"})
    }

    if (req.body.name.length<2) {
        errors.push({text: "Category name is too small"})
    }
    

    if (errors.length > 0) {
        res.render("admin/addcategories", {errors: errors})
    } else {

        const newCategory = {
            name: req.body.name,
            slug: req.body.slug,
        }
        new Category(newCategory).save().then(() => {
            console.log("Category created!")
            req.flash("success_msg", "Category created!")
            res.redirect('/admin/categories');
        }).catch((err) => {
            req.flash("error_msg", "Error on save category.")
            res.redirect('/admin');
            
        })
    }
})

router.get("/categories/edit/:id", (req,res) => {
    Category.findOne({_id: req.params.id}).lean().then((category) =>
        res.render("admin/editcategories", {category: category})
    ).catch((err) => {
        req.flash("error_msg", "Category not found")
        res.redirect("/admin/categories")

    })
    
})

router.post('/categories/categoryupdate', (req, res) => {
    Category.findByIdAndUpdate({_id: req.body.id}, {
        name : req.body.name,
        slug : req.body.slug
    }).then(() => {
            req.flash("success_msg", "Category successfully edited")
            res.redirect('/admin/categories');
        }).catch((err) => {
            req.flash("error_msg", "Internal error on saving category")
            res.redirect('/admin/categories');
        })
    })

router.post('/categories/delete', (req, res) => {
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Category deleted!")
        res.redirect("/admin/categories")
    }).catch( (err) => {
        req.flash("error_msg", "There is an error: " + err)
        res.redirect("/admin/categories")
    })
})

router.get("/posts", (req, res) => {
    Post.find({}).lean().populate("category").sort({date: 'desc'}).then((posts) => {
        res.render("admin/posts", {posts: posts})
    }).catch((err) => {
        req.flash("error_msg", "Error on listing posts: " + err)
    })
})

router.get("/posts/add", (req, res) => {
    Category.find().lean().then((categories) => {
        res.render("admin/addpost", {categories: categories})
    }).catch((err) => {
        req.flash("error_msg", "Error on load form: " + err)
        res.redirect("/admin")
    })

router.post("/posts/new", (req, res) => {
    var errors = []
    if (req.body.categoruy == "0") {
            errors.push({text: "Category is invalid!"})
        }
        
    
    if (errors.length > 0) {
        res.render("admin/posts/add", {errors: errors})
    } else {
    
        const newPost = {
            title: req.body.title,
            slug: req.body.slug,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category
        }

        new Post(newPost).save().then(() => {
            req.flash("success_msg", "Post created!")
            res.redirect("/admin/posts")
        }).catch((err) => {
            req.flash("error_msg", "Error on saving post: " + err)
            res.redirect("/admin")
        })
    }
})
    
})


router.get("/posts/edit/:id", (req,res) => {
    Post.findOne({_id: req.params.id}).lean().then((post) => {
    Category.find().lean().then((categories) => {
        res.render("admin/editposts", {categories: categories, post: post})

    }).catch((err) => {
        req.flash("error_msg", "Categories not found"+err)
        res.redirect("/admin/posts")

    })

    }).catch((err) => {
        req.flash("error_msg", "Post not found")
        res.redirect("/admin/posts")

    })
    
})

router.post("/posts/update", (req, res) => {

    Post.findByIdAndUpdate({_id: req.body.id}, {
        title : req.body.title,
        slug : req.body.slug,
        description : req.body.description,
        content : req.body.content,
        category : req.body.category
        }
    ).then(() => {
        req.flash("success_msg", "Post succesfuly updated")
        res.redirect("/admin/posts")
    }

    ).catch((err) => {
        req.flash("error_msg", "Error on updating post " + err)
        res.redirect("/admin/posts")

    })
})

router.get("/posts/delete/:id", (req, res) => {
    // It's not a safe mode.
    Post.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Post succesfuly deleted")
        res.redirect("/admin/posts")
    }).catch((err) => {
        req.flash("error_msg", "Error on deleting post " + err)
        res.redirect("/admin/posts")
    })
})