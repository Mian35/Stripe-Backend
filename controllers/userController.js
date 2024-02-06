const User = require('../models/User');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const mongoose = require("mongoose")
// Remove password from output

const create = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, password, address } = req.body
  let image = req.file
  if (!firstname, !lastname, !email, password, !address) {
    return AppError(res, 400, false, 'Please provide all values');
  }
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    return AppError(res, 400, false, 'User already exist');

  }
  if (image !== undefined) {
    image = req.file.filename
  }
  if (req.user.role !== 'admin') {
    return AppError(res, 400, false, 'Only admin can create user,Please go to register to register as a user');
  }
  const newUser = await User.create({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    address: address,
    ProfileImage: image
  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // // console.log(url);
  // await new Email(newUser, url).sendWelcome();

  AppError(res, 200, true, 'User created successfully ', newUser);
});
const getUsers = async (req, res) => {
  const data = await User.find();
  if (req.user.role !== 'admin') {
    return AppError(res, 400, false, 'Only admin can get all users');
  }
  AppError(res, 200, true, 'Total Users', data);

};



const updateUser = async (req, res) => {
  

  
  const valid = mongoose.Types.ObjectId.isValid(req.params.id);

if (!valid) {
  return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
}

const userExist = await User.findById(req.params.id);

if (!userExist) {
  return AppError(res, 400, false, 'No User with this Id');
}

const user = await User.findByIdAndUpdate(
  req.params.id,
  {
    $inc: { tokens: -1 }, // Decrement the value of 'tokens' by 1
  },
  { new: true } // to reload the data automatically after hitting the API once
);

AppError(res, 200, true, 'User updated successfully', user);
}
const updateProfile = async (req, res) => {
 
  var valid = mongoose.Types.ObjectId.isValid(req.params.id);
  if(! valid)
  {
      return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
  }
  let userExist = await User.findById(req.params.id)
  if(! userExist){
    return AppError(res, 400, false, 'No User with this Id');
  }
  

  
  
  const user = await User.findByIdAndUpdate(req.params.id, {
   $set:{tokens: 50, plan:'Premium'}
  },
  { new:true} // to reload the data automatically after hitting the api once
  )



  AppError(res, 200, true, 'profile updated successfully ', user);

}
const updateStandard = async (req ,res) => {
  var valid = mongoose.Types.ObjectId.isValid(req.params.id);
  if(! valid)
  {
      return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
  }
  let userExist = await User.findById(req.params.id)
  if(! userExist){
    return AppError(res, 400, false, 'No User with this Id');
  }
  

  
  
  const user = await User.findByIdAndUpdate(req.params.id, {
   $set:{tokens: 20, plan:'Standard'}
  },
  { new:true} // to reload the data automatically after hitting the api once
  )



  AppError(res, 200, true, 'profile updated successfully ', user);
}
const deleteProfile = async (req, res) => {


  if (req.user.id !== req.params.id) {
    return AppError(res, 400, false, 'You cannot delete other users');
  }
  var valid = mongoose.Types.ObjectId.isValid(req.params.id);
  if(! valid)
  {
      return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
  }
  let userExist = await User.findById(req.params.id)
  if(! userExist){
    return AppError(res, 400, false, 'No User with this Id');
  }
  let user = await User.findByIdAndDelete(req.params.id)



  AppError(res, 200, true, 'user profile deleted successfully ', null);

}

const deleteUser = async (req, res) => {
  const { userId } = req.params
  if (req.user.role !== 'admin') {
    return AppError(res, 400, false, 'Only admin can delete  users');
  }
  var valid = mongoose.Types.ObjectId.isValid(req.params.id);
  if(! valid)
  {
      return AppError(res, 400, false, 'Not a Valid ID!, Please provide a valid ID');
  }
  let userExist = await User.findById(req.params.id);
  if(!userExist){
    return AppError(res, 400, false, 'No User with this ID');
  }
  let user = await User.findByIdAndDelete(userId)
  AppError(res, 200, true, 'user deleted successfully ', null);
}

module.exports = { create, getUsers, updateUser, updateProfile, deleteProfile, deleteUser, updateStandard };