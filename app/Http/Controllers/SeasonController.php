<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSeasonRequest;
use App\Http\Requests\UpdateSeasonRequest;
use App\Models\Season;
use App\Models\Show;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Routing\Controller as BaseController;
class SeasonController extends BaseController
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
    public function index($show)
    {
        try {
            $seasons = Season::where('show_id', $show)->with( 'episodes')
            ->withCount(['likes', 'dislikes', 'episodes'])
            ->get();
            return response()->json($seasons, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to retrieve seasons'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSeasonRequest $request)
    {
        try {
        $validated = $request->validated();

        // Handle sequential season number validation
        $show = Show::find($validated['show_id']);
        // Handle show not found
        if (!$show) {
            return response()->json(['error' => 'Show not found'], 404);
        }
        // Check for existing season number
        if($show->seasons()->where('season_number', $validated['season_number'])->exists()) {
            return response()->json(['error' => 'Season number already exists for this show'], 409);
        }
        // Ensure season numbers are sequential
        if($show->seasons()->latest('season_number')->first()) {
            $latestSeasonNumber = $show->seasons()->latest('season_number')->first()->season_number;
            if($validated['season_number'] != $latestSeasonNumber + 1) {
                return response()->json(['error' => 'Season number must be sequential'], 422);
            }
        } else {
            if($validated['season_number'] != 1) {
                return response()->json(['error' => 'First season number must be 1'], 422);
            }
        }

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters', 'public');
            $validated['poster'] = URL::to(Storage::url($path));
        }
        $season = Season::create($validated);
        return response()->json($season, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create season', $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Season $season)
    {
        return response()->json($season->load('show', 'episodes')
        ->loadCount(['likes', 'dislikes', 'episodes']), 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeasonRequest $request, Season $season)
    {
        try {
        $validated = $request->validated();

                // Handle sequential season number validation
        $show = Show::find($season->show_id);
        // Handle show not found
        if (!$show) {
            return response()->json(['error' => 'Show not found'], 404);
        }
        // Check for existing season number
        if($show->seasons()->where('season_number', $validated['season_number'])->exists()) {
            return response()->json(['error' => 'Season number already exists for this show'], 409);
        }
        // Ensure season numbers are sequential
        if($show->seasons()->latest('season_number')->first()) {
            $latestSeasonNumber = $show->seasons()->latest('season_number')->first()->season_number;
            if($validated['season_number'] != $latestSeasonNumber + 1) {
                return response()->json(['error' => 'Season number must be sequential'], 422);
            }
        } else {
            if($validated['season_number'] != 1) {
                return response()->json(['error' => 'First season number must be 1'], 422);
            }
        }

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters', 'public');
            $validated['poster'] = URL::to(Storage::url($path));
        }

        $season->update($validated);
        return response()->json($season, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update season', $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Season $season)
    {
        try {
        $season->delete();
        return response()->json(['message' => 'Season deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete season'], 500);
        }
    }
}
