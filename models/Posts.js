import mongoose from "mongoose";

const Post = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("posts", Post)