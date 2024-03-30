const asyncHandler = (func) => async (req,res,next) => {
    try {
        await func(req,res,next)
    } catch (err) {
        res.status(500).json({
        code: err.code,
        error: err.message
       }) 
       next(err)       
    }    
} 

export { asyncHandler }