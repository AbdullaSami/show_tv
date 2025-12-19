<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEpisodeRequest;
use App\Http\Requests\UpdateEpisodeRequest;
use App\Models\Episode;
use App\Models\Season;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Routing\Controller as BaseController;

class EpisodeController extends BaseController
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show']);
        $this->middleware('permission:create content')->only(['create', 'store']);
        $this->middleware('permission:edit content')->only(['edit', 'update']);
        $this->middleware('permission:delete content')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Episode::query()
                ->with(['season.show'])
                ->withCount(['likes', 'dislikes']);

            if ($request->filled('season_id')) {
                $query->where('season_id', $request->input('season_id'));
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where('title', 'like', "%{$search}%");
            }

            if ($request->filled('latest')) {
                $limit = (int) $request->input('latest');
                if ($limit <= 0) {
                    $limit = 10;
                }
                if ($limit > 50) {
                    $limit = 50;
                }

                $episodes = $query->latest()->limit($limit)->get();
            } else {
                $episodes = $query->get();
            }

            return response()->json([
                'status' => 'success',
                'data' => $episodes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve episodes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bySeason($season)
    {
        try {
            $episodes = Episode::where('season_id', $season)
                ->withCount(['likes', 'dislikes'])
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $episodes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve episodes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEpisodeRequest $request)
    {
        try {
            $validatedData = $request->validated();

            $season = Season::find($validatedData['season_id']);
            // Handle season not found
            if (!$season) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Season not found'
                ], 404);
            }
            // Check for existing episode number
            if ($season->episodes()->where('episode_number', $validatedData['episode_number'])->exists()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Episode number already exists for this season'
                ], 409);
            }
            // Ensure episode numbers are sequential
            if ($season->episodes()->latest('episode_number')->first()) {
                $latestEpisodeNumber = $season->episodes()->latest('episode_number')->first()->episode_number;
                if ($validatedData['episode_number'] != $latestEpisodeNumber + 1) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Episode number must be sequential'
                    ], 422);
                }
            } else {
                // First episode must be episode number 1
                if ($validatedData['episode_number'] != 1) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'First episode number must be 1'
                    ], 422);
                }
            }
            if ($request->hasFile('thumbnail')) {
                $path = $request->file('thumbnail')->store('thumbnails', 'public');
                $validatedData['thumbnail'] = URL::to(Storage::url($path));
            }
            if ($request->hasFile('video_url')) {
                $path = $request->file('video_url')->store('episodes', 'public');
                $validatedData['video_url'] = URL::to(Storage::url($path));
            }
            $episode = Episode::create($validatedData);
            return response()->json([
                'status' => 'success',
                'data' => $episode
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create episode',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Episode $episode)
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => $episode
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve episode',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEpisodeRequest $request, Episode $episode)
    {
        try {
            $validatedData = $request->validated();

            $season = Season::find($validatedData['season_id']);
            // Handle season not found
            if (!$season) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Season not found'
                ], 404);
            }
            // Check for existing episode number (ignore current episode)
            if (
                $season->episodes()
                ->where('episode_number', $validatedData['episode_number'])
                ->where('id', '!=', $episode->id)
                ->exists()
            ) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Episode number already exists for this season'
                ], 409);
            }

            if ($request->hasFile('thumbnail')) {
                $path = $request->file('thumbnail')->store('thumbnails', 'public');
                $validatedData['thumbnail'] = URL::to(Storage::url($path));
            }
            if ($request->hasFile('video_url')) {
                $path = $request->file('video_url')->store('videos', 'public');
                $validatedData['video_url'] = URL::to(Storage::url($path));
            }
            $episode->update($validatedData);
            return response()->json([
                'status' => 'success',
                'data' => $episode
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => "Couldn't save updates",
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Episode $episode)
    {

        try {
            $episode->delete();
            return response()->json(['message' => 'Episode deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete episode'], 500);
        }
    }
}
