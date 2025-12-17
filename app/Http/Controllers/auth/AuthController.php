<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Logic\UserLogic;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;
class AuthController extends Controller
{

    public function __construct(protected UserLogic $userLogic)
    {
    }

    // Register a new user
    public function register(Request $request){
        try {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'role' => 'nullable|in:admin,user,moderator',
        ]);

        // handle user image upload if provided
        if($request->hasFile('image')){
            $imagePath = $request->file('image')->store('users_images', 'public');
            $validatedData['image'] = URL::to(Storage::url($imagePath));
        }

        // insert user data into database
        $user = $this->userLogic->insert($validatedData);
        // assign registered user to user role
        $user->assignRole('user');

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_image' => $user->image,
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->getMessage(),
        ], 422);
    }
    }

    // Login an existing user
    public function login(Request $request){
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)){
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_image' => $user->image,
        ], 200);
    }

    // Logout the authenticated user
    /** @var PersonalAccessToken|null $token */
    public function logout(Request $request){

        $token = $request->user()->currentAccessToken();
        $token?->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }

    // Get the authenticated user's details
    public function me(Request $request){
        return response()->json($request->user(), 200);
    }
}
