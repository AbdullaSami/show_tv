<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermissionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $permission
     * @return \Illuminate\Http\Response
     */
    public function handle(Request $request, Closure $next, $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // dd( $user->hasPermissionTo($permission));
        // Check if user has the permission either directly or via roles
        if (!$user->hasPermissionTo($permission)) {
            return response()->json([
                'message' => 'You do not have the required permission.',
            ], 403);
        }

        return $next($request);
    }
}
