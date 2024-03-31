class ApiError extends Error {
    constructor(
        statusCode,
        errorMessage = "something went wrong",        
    ){
        super(errorMessage)
        this.statusCode = statusCode
    }
}

export { ApiError }



