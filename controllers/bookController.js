const books = require('../Models/bookModels')
const stripe= require('stripe')(process.env.STRIPEKEY)
const {GoogleGenerativeAI} = require('@google/generative-ai')

exports.addBookController = async(req, res) => {
    console.log("inside add book controller");

    const { title, author, pages, imageUrl, price, discountPrice, abstract, publisher, isbn, language, category } = req.body

    const uploadImages = req.files.map(item => item.filename)

    const sellerEmail = req.payload


    console.log("Title:", title);
    console.log("Author:", author);
    console.log("Pages:", pages);
    console.log("Image URL:", imageUrl);
    console.log("Price:", price);
    console.log("Discount Price:", discountPrice);
    console.log("Abstract:", abstract);
    console.log("Publisher:", publisher);
    console.log("ISBN:", isbn);
    console.log("Language:", language);
    console.log("Category:", category);
    console.log("Uploaded Images:", uploadImages);
    console.log("Seller Email:", sellerEmail);

    const exisitingBook = await books.findOne({title,sellerEmail})
    if(exisitingBook){
        res.status(409).json("Book already exist... operation denied")
    }
    else{
        const newBook = await books.create({ title, author, pages, imageUrl, price, discountPrice, abstract, publisher, isbn, language, category, uploadImages, sellerEmail })
        res.status(200).json(newBook)
    }
}

//get latest 4 books
exports.getHomePageBooksController = async (req, res) => {
    const homebooks = await books.find().sort({ _id: -1 }).limit(4)
    res.status(200).json(homebooks)
}

//get all books apart from login user
exports.getBookPageBooksController = async (req,res)=>{
console.log("inside add book controller");
const loginUseMail = req.payload
const searchKey = req.query.search
const allbooks = await books.find({sellerEmail:{$ne: loginUseMail},title:{$regex:searchKey,$options:"i"}})
res.status(200).json(allbooks)
}

//get user bought books
exports.getUserBooksController = async (req,res)=>{
    console.log("inside getUserBookscontroller");
    const loginUseMail = req.payload
    const userbooks = await books.find({sellerEmail: loginUseMail})
    res.status(200).json(userbooks)
}

//display books buy by the login user
exports.getUserBoughtBooksController = async (req,res)=>{
    console.log("inside getUserBoughtBookscontroller");
    const loginUseMail = req.payload
    const userboughtbooks = await books.find({buyerEmail: loginUseMail})
    res.status(200).json(userboughtbooks)
}

//get single book
exports.getSingleBookController = async (req, res) => {
    console.log("inside getSingleBookController");
    const { id } = req.params
    const bookDetails = await books.findById({_id:id})
    res.status(200).json(bookDetails)
}

//remove book
exports.removeBookController = async (req, res) => {
    console.log("inside removeBookController");
    const { id } = req.params
    const dltBook = await books.findByIdAndDelete({_id:id})
    res.status(200).json(dltBook)
}


exports.bookPaynmentController=async(req,res)=>{
    console.log("bookPaynmentController");
    const { id } = req.params
    const loginUserMail = req.payload
    const bookDetails= await books.findById({_id:id})
    const session = await stripe.checkout.sessions.create({
     line_items: [
    {
      price_data: {
        currency:'usd',
        product_data:{
            name:bookDetails.title
        },
        unit_amount:Math.round(bookDetails.discountPrice*100)
      },
      quantity: 1,
    },
   ],
   mode: 'payment',
   metadata:{
    bookId:id,
    buyerEmail:loginUserMail
   },
   success_url:'https://book-store-client-pi.vercel.app/success?session_id={CHECKOUT_SESSION_ID}',
   cancel_url:'https://book-store-client-pi.vercel.app/cancel'
  });
  console.log(session)
  res.status(200).json({checkoutURL:session.url})
}

exports.verifyPaymentController=async(req,res)=>{
    console.log("inside verifyPaymnetController");
    const {sessionId}=req.body
    const session= await stripe.checkout.sessions.retrieve(sessionId)
    if(session.payment_status=='paid'){
        const bookid = session.metadata.bookId
        const email = session.metadata.buyerEmail

        const book = await books.findOne({_id:bookid})
        book.status='sold'
        book.buyerEmail=email
        await book.save()
        res.status(200).json({message:"payment verified",book})

    }
    else{
        res.status(400).json("payment not completed")
    }
}

//get all books
exports.getAllBooksController=async (req,res)=>{

const allbooks = await books.find()
res.status(200).json(allbooks)
}

//update book status
exports.approveBookController=async(req,res)=>{
   console.log("inside approveBookController");
   const {id} = req.params
    const book = await books.findById({_id:id})
    book.status='approved'
    await book.save()
    res.status(200).json(book)
}

//get book abstract
exports.generateBookAbstractController= async (req,res)=>{
    console.log('inside generateBookAbstractController ')
    
    const genAI= new GoogleGenerativeAI(process.env.GEMINI_API)
    const {title}=req.body
    const model = genAI.getGenerativeModel({
        model:'gemini-3.5-flash'
    })

    const result = await model.generateContent(`Give me a short abstract of the book ${title} as plain text`)
    // console.log(result)
    const reply = result.response
    
    res.status(200).json({
        success : true,
        content : reply.candidates[0].content.parts[0].text
    })
}

