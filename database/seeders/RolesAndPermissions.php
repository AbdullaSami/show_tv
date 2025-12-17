<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class RolesAndPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'user']);
        $moderatorRole = Role::create(['name' => 'moderator']);

        // create permissions
        $permissions = [
            // user related permissions
            'view users',
            'create users',
            'edit users',
            'update users',
            'delete users',
            // content related permissions
            'view content',
            'create content',
            'edit content',
            'delete content'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // assign all permissions to admin role
        $adminRole->givePermissionTo(Permission::all());
        // assign limited permissions to moderator role
        $moderatorRole->givePermissionTo([
            'view users',
            'view content',
            'create content',
            'edit content',
        ]);
        $userRole->givePermissionTo([
            'view content',
        ]);
        // create a default admin user
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@show.tv',
            'password' => Hash::make('password123'), // make sure to hash the password
        ]);
        $adminUser->assignRole($adminRole);
    }
}
