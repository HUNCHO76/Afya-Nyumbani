<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class BaseController extends \App\Http\Controllers\Controller
{
    /**
     * Send success response
     */
    public function sendResponse($data, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Send error response
     */
    public function sendError(string $message, int $status = 400, $errors = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
