const { analysisByModel } = require("../utils/GenAI")

exports.analyseResume = async(req, res, next)=>{
    try {
        if (!req.file){
            return res.status(400).json({status : false, message : "Resume not found."})
        }
        const {path, mimetype} = req.file
        const {jobdesc} = req.body
        const analysis = await analysisByModel(path, mimetype, jobdesc)

        return res.status(200).json({success : true , message : 'Resume Analysed', analysis})
    } 
    catch (e) {
        console.log(e)
    }
}