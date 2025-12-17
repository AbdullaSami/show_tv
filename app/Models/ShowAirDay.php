<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShowAirDay extends Model
{
    protected $fillable = [
        'show_id',
        'day',
    ];

    public function show()
    {
        return $this->belongsTo(Show::class);
    }
}
