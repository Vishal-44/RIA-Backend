const {Router} = require('express')
const multer = require('multer')
const { analyseResume} = require('../Controller/servicesController.js')


const storage  = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, './uploads')
    },

    filename : (req, file, cb) =>{
        cb(null, file.originalname)
    }
})


const upload = multer({storage})

const router = Router()

router.route('/analyse-resume').post(upload.single('resume'), analyseResume)

module.exports = router