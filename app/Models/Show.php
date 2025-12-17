<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Show extends Model
{
    /** @use HasFactory<\Database\Factories\ShowFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'poster',
        'air_time'
    ];

    public function seasons()
    {
        return $this->hasMany(Season::class);
    }

    public function airDays()
    {
        return $this->hasMany(ShowAirDay::class)->select('show_id','day');
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
