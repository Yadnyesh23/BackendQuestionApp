class ApiResponse {
    constructor(statusCode, data, message) {
        this.statusCode = statusCode;
        this.success = true;
        this.data = data;
        this.message = message
    }
}

export default ApiResponse;