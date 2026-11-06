const multer = require('multer')

// define storage space for uploaded file
const storage = multer.diskStorage({

    destination: (req, file, callback) => {

        callback(null, './uploads')
    },
    filename: (req, file, callback) => {
        callback(null, `Image-${file.originalname}-${Date.now()}`)

    }

})

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
        callback(null, true)

    }
    else {
        callback(null, false)
    }
}

const multerMiddleware = multer({
    storage,fileFilter
})

module.exports = multerMiddleware