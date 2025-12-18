<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use Illuminate\Http\Request;

class FollowController extends Controller
{

    public function follow(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;
        $request->validate([
            'show_id' => 'required|exists:shows,id',
        ]);

        $follow = Follow::create([
            'user_id' => $userId,
            'show_id' => $request->show_id,
        ]);

        return response()->json(['message' => 'Successfully followed user', 'follow' => $follow], 201);
    }

    public function unfollow(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;
        $request->validate([
            'show_id' => 'required|exists:shows,id',
        ]);

        $follow = Follow::where('user_id', $userId)
                        ->where('show_id', $request->show_id)
                        ->first();

        if ($follow) {
            $follow->delete();
            return response()->json(['message' => 'Successfully unfollowed user'], 200);
        } else {
            return response()->json(['message' => 'Follow relationship not found'], 404);
        }
    }
}
