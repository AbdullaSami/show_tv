<?php

use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\EpisodeController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
// controllers
use App\Http\Controllers\ShowController;
use App\Http\Controllers\SeasonController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Users routes
Route::apiResource('users', UserController::class)->middleware('auth:sanctum');
// permissions routes
Route::get('/permissions', function(Request $request){
    return Permission::all();
});
// Shows routes
Route::apiResource('shows', ShowController::class);
// Seasons routes
Route::apiResource('seasons', SeasonController::class);
Route::get('/show/{show}/seasons', [SeasonController::class, 'index']);
// Episodes routes
Route::apiResource('episodes', EpisodeController::class);
Route::get('/season/{season}/episodes', [EpisodeController::class, 'bySeason']);

// (Un)Follow routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/followed-shows', [FollowController::class, 'followedShows']);
    Route::post('/follow', [FollowController::class, 'follow']);
    Route::delete('/unfollow', [FollowController::class, 'unfollow']);
});

// Reactions routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Like a model
    Route::post('/reaction/like', [ReactionController::class, 'like'])->name('reaction.like');

    // Dislike a model
    Route::post('/reaction/dislike', [ReactionController::class, 'dislike'])->name('reaction.dislike');

    // Remove reaction from a model
    Route::delete('/reaction', [ReactionController::class, 'remove'])->name('reaction.remove');
});
