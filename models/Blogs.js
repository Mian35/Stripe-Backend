const mongoose = require('mongoose');
const User = require('./User.js')
const blogSchema = new mongoose.Schema({
    
    video:{
type: String,
required: [true,'please provide a Video'],
default: null
    },
    
    createdBy: 
        {
        type: mongoose.Schema. ObjectId,
        ref: 'user',
        required: [true, 'Please provide user'],
        },
    
        rectangle:{
    type: Boolean,
    default: false
}
      
},
{ timestamps: true }
);
blogSchema.pre(/^find/, function(next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });
  //to populate the user model to receive user information in the blogs
    this.populate({
      path: 'createdBy',
      select: 'firstname lastname email address ProfileImage'
    });
    next();
  });

module.exports = mongoose.model("blog", blogSchema)