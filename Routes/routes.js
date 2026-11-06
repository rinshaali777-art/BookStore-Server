const express = require('express')
const userController = require('../controllers/userController')
const authMiddleware = require('../Middlewares/authMiddleware')
const multiMiddleWare = require('../Middlewares/multerMiddleware')
const bookController = require('../controllers/bookController')
const adminauthMiddleware = require('../Middlewares/adminAuthMiddleware')


// to set up routes outside express server, create object for router class in express
const router = new express.Router()

// register
router.post('/register',userController.registerController)

// login
router.post('/login',userController.loginController)

// google
router.post('/google-login',userController.googleController)


router.get('/homebooks',bookController.getHomePageBooksController)


//-------------------authorized user -----------------------------

// edit
router.put('/user/edit/:id',authMiddleware,multiMiddleWare.single('picture'),userController.userEditController)

// bookupload
router.post('/add-book',authMiddleware,multiMiddleWare.array('uploadImages',3),bookController.addBookController)

//only login user see all book
router.get('/all-books',authMiddleware,bookController.getBookPageBooksController)

//get user  books
router.get('/user-books',authMiddleware,bookController.getUserBooksController)

//display books buy by the login user
router.get('/bought-books',authMiddleware,bookController.getUserBoughtBooksController)

//get single book
router.get('/single-book/:id',authMiddleware,bookController.getSingleBookController)

//remove book
router.delete('/remove-book/:id',authMiddleware,bookController.removeBookController)

//makepayment
router.get('/make-payment/:id',authMiddleware,bookController.bookPaynmentController)

//verify payment
router.post('/verify-payment',authMiddleware,bookController.verifyPaymentController)

//get book abstract via ai
router.post('/books-ai',authMiddleware,bookController.generateBookAbstractController)


//------------------------admin-----------------------------------------
router.get('/books',adminauthMiddleware,bookController.getAllBooksController)


// admin edit
router.put('/admin/edit/:id',adminauthMiddleware,userController.adminEditController)

// upadate book status
router.put('/book-update/:id',adminauthMiddleware,bookController.approveBookController)

//get all users
router.get('/all-users',adminauthMiddleware,userController.getAllUsersController)

module.exports = router