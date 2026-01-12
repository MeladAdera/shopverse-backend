export class ResponseHelper {
    static success(res, message = 'تمت العملية بنجاح', data, statusCode = 200) {
        const response = {
            success: true,
            message,
            timestamp: new Date().toISOString()
        };
        if (data !== undefined && data !== null) {
            response.data = data;
        }
        return res.status(statusCode).json(response);
    }
    static created(res, message, data) {
        return this.success(res, message, data, 201);
    }
    static successMessage(res, message) {
        return res.json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }
    static paginated(res, message, data, pagination) {
        return this.success(res, message, {
            items: data,
            pagination
        });
    }
    // ⭐ الدالة الجديدة
    static error(res, statusCode = 500, message, errorCode, details) {
        const response = {
            success: false,
            message,
            timestamp: new Date().toISOString()
        };
        if (errorCode) {
            response.errorCode = errorCode;
        }
        if (details !== undefined && details !== null) {
            response.details = details;
        }
        return res.status(statusCode).json(response);
    }
}
