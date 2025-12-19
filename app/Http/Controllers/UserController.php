<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Routing\Controller as BaseController;
use App\Logic\UserLogic;

class UserController extends BaseController
{
    public function __construct(protected UserLogic $userLogic)
    {
        $this->middleware("permission:view users")->only(["index", "show"]);
        $this->middleware("permission:create users")->only(["store"]);
        $this->middleware("permission:edit users")->only(["update"]);
        $this->middleware("permission:delete users")->only(["destroy"]);
    }

    public function index()
    {
        $users = User::with('roles', 'permissions')->get();
        return response()->json($users);
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'role' => 'nullable|in:admin,user,moderator',
                'permissions' => 'nullable|array',
                'permissions.*' => 'exists:permissions,id',
            ]);
            // insert user data into database
            $user = $this->userLogic->insert($validatedData);
            // assign registered user to user role
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->getMessage(),
            ], 422);
        }
    }

    public function show($user)
    {
        try {
            $user = User::findOrFail($user);
            return response()->json($user);
        } catch (\Exception) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            $validatedData = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $user->id,
                'password' => 'sometimes|nullable|string|min:8',
                'image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'role' => 'sometimes|nullable|in:admin,user,moderator',
                'permissions' => 'sometimes|nullable|array',
                'permissions.*' => 'exists:permissions,id',
            ]);


            $user = $this->userLogic->update($user, $validatedData);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy($user)
    {
        $findUser = User::findOrFail($user);
        $findUser->delete();
        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
