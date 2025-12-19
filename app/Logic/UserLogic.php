<?php

namespace App\Logic;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class UserLogic
{

    public function insert($validatedData)
    {

        $newUser = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
            'image' => $validatedData['image'] ?? null
        ]);
        // Assign role (admin only)
        if (isset($validatedData['role']) && auth()->user()->hasRole('admin')) {

            $newUser->assignRole($validatedData['role']);
        } else {
            $newUser->assignRole('user');
        }
        // Assign permissions (admin only)
        if (
            isset($validatedData['permissions']) &&
            auth()->user()->hasRole('admin')
        ) {
            $permissionIds = array_values(array_filter($validatedData['permissions'], function ($v) {
                return is_numeric($v);
            }));
            $permissions = Permission::whereIn('id', $permissionIds)->get();
            $newUser->syncPermissions($permissions);
        }
        return $newUser;
    }

    public function update(User $user, array $validatedData)
    {
        $user->update([
            'name'  => $validatedData['name'],
            'email' => $validatedData['email'],
            'image' => $validatedData['image'] ?? $user->image,
        ]);

        if (!empty($validatedData['password'])) {
            $user->update([
                'password' => bcrypt($validatedData['password']),
            ]);
        }

        // Sync role (admin only)
        if (isset($validatedData['role']) && auth()->user()->hasRole('admin')) {
            $user->syncRoles([$validatedData['role']]);
        }

        // Sync permissions (admin only)
        if (
            isset($validatedData['permissions']) &&
            auth()->user()->hasRole('admin')
        ) {
            $permissionIds = array_values(array_filter($validatedData['permissions'], function ($v) {
                return is_numeric($v);
            }));
            $permissions = Permission::whereIn('id', $permissionIds)->get();
            $user->syncPermissions($permissions);
        }

        return $user;
    }
}
