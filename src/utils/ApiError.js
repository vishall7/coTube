class ApiError extends Error {
    constructor(
        statusCode,
        errorMessage = "something went wrong",        
    ){
        this.message = errorMessage,
        this.statusCode = statusCode
    }
}

export { ApiError }



