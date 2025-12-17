<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShowRequest;
use App\Http\Requests\UpdateShowRequest;
use App\Models\Show;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
class ShowController extends BaseController
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
    public function index()
    {
        try{
            $shows = Show::with('airDays', 'seasons')
            ->withCount(['likes as likesCount', 'dislikes as dislikesCount'])
            ->get();
            return response()->json([
                'data' => $shows
            ], 200);
        }catch(\Exception $e){
            return response()->json(['error' => 'Failed to retrieve shows', $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreShowRequest $request)
    {
        try{
        $validated = $request->validated();

        if($request->hasFile('poster')) {
            $path = $request->file('poster')->store('posters', 'public');
            $validated['poster'] = URL::to(Storage::url($path));
        }
        $show = Show::create($validated);
        $airDays = array_map(fn($day) => ['day' => $day], $validated['air_days']);
        $show->airDays()->createMany($airDays);
        return response()->json(
            [
                'message' => 'Show created successfully',
                'show' => $show,
                'air_days' => $airDays
            ]
            );
        }catch(\Exception $e){
            return response()->json(['error' => 'Validation failed', $e->getMessage()], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Show $show)
    {
        try{
            $show->load('airDays', 'seasons.episodes')->loadCount(['likes as likesCount', 'dislikes as dislikesCount']);
            return response()->json($show, 200);
        }catch(\Exception $e){
            return response()->json(['error' => 'Failed to retrieve show', $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateShowRequest $request, Show $show)
    {
        try{
            $validated = $request->validated();

            if($request->hasFile('poster')) {
                $path = $request->file('poster')->store('posters', 'public');
                $validated['poster'] = URL::to(Storage::url($path));
            }

            $show->update($validated);

            if(isset($validated['air_days'])) {
                $show->airDays()->delete();
                $airDays = array_map(fn($day) => ['day' => $day], $validated['air_days']);
                $show->airDays()->createMany($airDays);
            }

            return response()->json(
                [
                    'message' => 'Show updated successfully',
                    'show' => $show,
                    'air_days' => $airDays
                ]
                );
            }catch(\Exception $e){
                return response()->json(['error' => 'Validation failed', $e->getMessage()], 400);
            }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Show $show)
    {
        try{
            $show->delete();
            return response()->json(['message' => 'Show deleted successfully'], 200);
        }catch(\Exception $e){
            return response()->json(['error' => 'Failed to delete show', $e->getMessage()], 500);
        }
    }
}
