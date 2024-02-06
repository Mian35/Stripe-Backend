const Blog = require('../models/Blogs');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require("../utils/apiFeatures");
const mongoose = require('mongoose')

const createBlogs = catchAsync(async (req, res, next) => {

    let video = req.file

    if (video !== undefined) {
        video = req.file.filename
    }

    const newBlog = await Blog.create({
        createdBy: req.user.id,
        video: video, // Fix the typo here from 'vodeo' to 'video'
    });

    AppError(res, 200, true, 'Blog Created Successfully', newBlog);
});

const getAll = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Blog.find(), req.query).filter().limitFields().paginate().sort();
    const blogs = await features.query
    AppError(res, 200, true, 'Total Blogs ', blogs);
});
const getOne = catchAsync(async (req, res, next) => {
    var valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
    }
    let blogExist = await Blog.findById(req.params.id);
    if (!blogExist) {
        return AppError(res, 400, false, 'No blog found with this  ID');
    }

    const blogs = await Blog.findOne({ _id: req.params.id });
    AppError(res, 200, true, 'Your Blog ', blogs);
});
const search = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { about: { $regex: req.params.key } },
            { blog: { $regex: req.params.key } },
            { blogImage: { $regex: req.params.key } }
        ]
    })
    AppError(res, 200, true, 'Result Found ', blogs);
})
const update = catchAsync(async (req, res, next) => {
    let image = req.file
    var valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
    }
    const blogs = await Blog.findById({ _id: req.params.id });
    if (!blogs) {
        return AppError(res, 400, false, 'No Blog with this id');
    }
    let convert = blogs.createdBy.id
    let converted = JSON.stringify(convert)
    let final = converted.replace(/"([^"]+(?="))"/g, '$1');

    if (req.user.role === 'admin') {
        if (image !== undefined) {
            image = req.file.filename
        }
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            about: req.body.about,
            blog: req.body.blog,
            blogImage: image,

        },
            { new: true } // to reload the data automatically after hitting the api once
        )

    }
    
    if ( final !== req.user.id) {
        return AppError(res, 400, false, 'Only publisher is allowed to update blogs');
    }

    if (image !== undefined) {
        image = req.file.filename
    }
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        about: req.body.about,
        blog: req.body.blog,
        blogImage: image,

    },
        { new: true } // to reload the data automatically after hitting the api once
    )
    AppError(res, 200, true, 'Updated Blog ', updatedBlog);

});

const remove = catchAsync(async (req, res, next) => {
    var valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
    }
    const blogs = await Blog.findById(req.params.id);
    if (!blogs) {
        return AppError(res, 400, false, 'No Blog with this id');
    }
    let convert = blogs.createdBy.id
    let converted = JSON.stringify(convert)
    let final = converted.replace(/"([^"]+(?="))"/g, '$1');
    console.log(final)
    if (req.user.role === 'admin') {
        const updatedBlog = await Blog.findByIdAndDelete(req.params.id, blogs)
    }
    if (req.user.role !== 'admin' && final !== req.user.id) {


        return AppError(res, 400, false, 'Only admin have the access to delete blogs');
    }
    const updatedBlog = await Blog.findByIdAndDelete(req.params.id, blogs)


    AppError(res, 200, true, 'Blog Deleted', null);

})

const publish = catchAsync(async (req, res, next) => {
    var valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
    }
    let blogExist = await Blog.findById(req.params.id);
    if (!blogExist) {
        return AppError(res, 400, false, 'No blog with this id to publish');
    }
    const blogs = await Blog.findByIdAndUpdate({ _id: req.params.id }, { $set: { rectangle: true } },
        { new: true }
    )
    
        AppError(res, 200, true, 'blog published successfully ', blogs);
    
})

const allpublished = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ published: true });
    // console.log(blogs)
    if (!blogs) {
        return AppError(res, 400, false, 'No blogs published yet');
    } else {

        // res.status(200).json({
        //     message: 'Punblished blogs',
        //     TotalPublished: blogs.length,
        //     data: {
        //         blogs
        //     }
        // })
        AppError(res, 200, true, 'Data found ', blogs);
    }
})

const publishAllBlogs = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {

        return AppError(res, 400, false, 'Only admin have the access to publish blogs');
    }
    const blogs = await Blog.updateMany({ $set: { published: true } });
    if (!blogs) {
        return AppError(res, 400, false, 'No blogs to publish');
    }
    const finalblogs = await Blog.find(blogs)
    AppError(res, 200, true, 'All blog published successfully ', finalblogs);

})
const createComment = catchAsync(async (req, res, next) => {
    let blogExist = await Blog.findById(req.params.id);
    if (!blogExist) {
        return AppError(res, 400, false, 'No blog with this id ');
    }
    try {


        let comment = req.body.comment;


        // const blogs = await Blog.findOne();
        // if(!blogs){
        //     return  AppError(res,400, false,'No Blog with this id');
        // }

        const updated = await Blog.findOneAndUpdate({ _id: req.params.id },
            {
                $push: {
                    comments: {
                        comment: comment,
                        commentBy: req.user.id
                    }
                }
            },
            { new: true }
        )

        AppError(res, 200, true, 'comment created successfully ', updated);
    } catch (err) {
        console.log(err)
    }
});

const updateComment = catchAsync(async (req, res, next) => {
    try {
        var valid = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!valid) {
            return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
        }
        let blogs = await Blog.findOne({ comments: { $elemMatch: { _id: req.params.id } } })

        if (!blogs) {
            return AppError(res, 404, false, 'No comment with this id');
        }
        let comment = null
        blogs.comments.forEach(item => {

            if (item._id == req.params.id) {
                comment = item
            }

        })

        let converted = JSON.stringify(comment.commentBy)
        let final = converted.replace(/"([^"]+(?="))"/g, '$1');

         
            console.log("updated because of admin")
            let mycomment = req.body.comment

            blogs = await Blog.findOneAndUpdate({ comments: { $elemMatch: { _id: req.params.id, 'comments.commentBy': req.user.id } } },


                {
                    $set: {
                        "comments.$.comment": mycomment
                    }
                },
                { new: true } // to reload the data automatically after hitting the api once
            );
        
        if ( final !== req.user.id) {
            return AppError(res, 400, false, 'Only admin or user itself can update comments!');
        }
         mycomment = req.body.comment

        blogs = await Blog.findOneAndUpdate({ comments: { $elemMatch: { _id: req.params.id, 'comments.commentBy': req.user.id } } },


            {
                $set: {
                    "comments.$.comment": mycomment
                }
            },
            { new: true } // to reload the data automatically after hitting the api once
        );




        AppError(res, 200, true, 'comment updated successfully', blogs);
    } catch (err) {
        console.log(err)
    }
});

const deleteComment = catchAsync(async (req, res, next) => {
    try {
        var valid = mongoose.Types.ObjectId.isValid(req.params.id);
        if (!valid) {
            return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
        }
        let blogs = await Blog.findOne({ comments: { $elemMatch: { _id: req.params.id } } })

        if (!blogs) {
            return AppError(res, 404, false, 'No comment with this id');
        }
        // return res.status(200).json({
        //     message: "Deleted successfully",
        //     data: blogs
        // })
        let comment = null
        blogs.comments.forEach(item => {

            if (item._id == req.params.id) {
                comment = item
            }

        })


        // console.log(req.user.id)
        // let final = converted.replace(/"([^"]+(?="))"/g, '$1');
        // console.log(final)

        let converted = JSON.stringify(comment.commentBy)
        let final = converted.replace(/"([^"]+(?="))"/g, '$1');
        console.log(final)
        if (req.user.role === 'admin') {
            let blog = await Blog.findOneAndUpdate({ comments: { $elemMatch: { _id: req.params.id, 'comments.commentBy': req.user.id } } },
                {
                    $pull: {
                        comments: {
                            _id: (req.params.id)
                        }
                    }
                }
            );
        }
        if ( final !== req.user.id) {
            return AppError(res, 400, false, 'Only admin or user itself can delete comments!');
        }

        let blog = await Blog.findOneAndUpdate({ comments: { $elemMatch: { _id: req.params.id, 'comments.commentBy': req.user.id } } },
            {
                $pull: {
                    comments: {
                        _id: (req.params.id)
                    }
                }
            }
        );
        AppError(res, 200, true, 'comment deleted successfully', null);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
});
const getCurrentUser = async(req , res) => {
    try {
        const getData = await Blog.find({createdBy:req.user.id});
    console.log(getData);
    AppError(res, 200, true, 'comment fetched successfully', getData);
    } catch (error) {
        return res.status(500).json({
            message: err.message
        })
 
    }
    
  }

module.exports = { createBlogs, getAll, getOne, search, update, remove, publish, allpublished, publishAllBlogs, updateComment, createComment, deleteComment, getCurrentUser }