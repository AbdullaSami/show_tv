<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    /** @use HasFactory<\Database\Factories\EpisodeFactory> */
    use HasFactory;

    protected $fillable = [
        'season_id',
        'episode_number',
        'title',
        'description',
        'duration',
        'air_time',
        'thumbnail',
        'video_url',
    ];

    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    public function reactions()
{
    return $this->morphMany(Reaction::class, 'reactable');
}

public function likes()
{
    return $this->reactions()->where('type', 'like');
}

public function dislikes()
{
    return $this->reactions()->where('type', 'dislike');
}


}
