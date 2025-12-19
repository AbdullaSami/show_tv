<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reaction;
use App\Models\Show;
use App\Models\Season;
use App\Models\Episode;

class ReactionController extends Controller
{

    public function like(Request $request)
    {
        return $this->react($request, 'like');
    }

    public function dislike(Request $request)
    {
        return $this->react($request, 'dislike');
    }

    private function react(Request $request, string $type)
    {
        $user = $request->user()->id;
        $validated = $request->validate([
            'reactable_id' => 'required|integer',
            'reactable_type' => 'required|string', // e.g., App\Models\Episode
        ]);

        $modelClass = $this->normalizeReactableType($validated['reactable_type']);
        $model = $modelClass::findOrFail($validated['reactable_id']);

        // Update or create reaction
        $reaction = Reaction::updateOrCreate(
            [
                'user_id' => $user,
                'reactable_id' => $model->id,
                'reactable_type' => $modelClass,
            ],
            ['type' => $type]
        );

        return $this->reactionResponse($model, $reaction);
    }

    public function remove(Request $request)
    {
        $user = $request->user()->id;
        $validated = $request->validate([
            'reactable_id' => 'required|integer',
            'reactable_type' => 'required|string',
        ]);

        $modelClass = $this->normalizeReactableType($validated['reactable_type']);
        $model = $modelClass::findOrFail($validated['reactable_id']);

        Reaction::where('user_id', $user)
            ->where('reactable_id', $model->id)
            ->where('reactable_type', $modelClass)
            ->delete();

        return $this->reactionResponse($model, null);
    }

    private function normalizeReactableType(string $reactableType): string
    {
        $type = strtolower(trim($reactableType));

        if ($type === 'show') return Show::class;
        if ($type === 'season') return Season::class;
        if ($type === 'episode') return Episode::class;

        return $reactableType;
    }

    private function reactionResponse($model, $reaction)
    {
        $likesCount = method_exists($model, 'likes') ? $model->likes()->count() : 0;
        $dislikesCount = method_exists($model, 'dislikes') ? $model->dislikes()->count() : 0;

        return response()->json([
            'status' => 'success',
            'reaction' => $reaction,
            'likes_count' => $likesCount,
            'dislikes_count' => $dislikesCount,
        ]);
    }
}
