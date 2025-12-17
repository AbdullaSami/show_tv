<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Season extends Model
{
    /** @use HasFactory<\Database\Factories\SeasonFactory> */
    use HasFactory;

    protected $fillable = [
        'show_id',
        'season_number',
        'title',
        'poster',
    ];

    public function show()
    {
        return $this->belongsTo(Show::class);
    }

    public function episodes()
    {
        return $this->hasMany(Episode::class);
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
