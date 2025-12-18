<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\EpisodeController;
use App\Http\Controllers\FollowController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// controllers
use App\Http\Controllers\ShowController;
use App\Http\Controllers\SeasonController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Shows routes
Route::apiResource('shows', ShowController::class);
// Seasons routes
Route::apiResource('seasons', SeasonController::class);
Route::get('/show/{show}/seasons', [SeasonController::class, 'index']);
// Episodes routes
Route::apiResource('episodes', EpisodeController::class);
Route::get('/season/{season}/episodes', [EpisodeController::class, 'index']);

// (Un)Follow routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/follow', [FollowController::class, 'follow']);
    Route::delete('/unfollow', [FollowController::class, 'unfollow']);
});
