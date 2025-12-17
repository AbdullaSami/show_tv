<?php

namespace App\Logic;

use App\Models\User;
class UserLogic
{

    public function insert($validatedData){

        $enwUser = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'image' => $validatedData['image'] ?? null
        ]);
        if(isset($validatedData['role']) && auth()->user()->hasRole('admin') ){

            $enwUser->assignRole($validatedData['role']);
        }else{
            $enwUser->assignRole('user');
        }
        return $enwUser;
    }
}

?>
