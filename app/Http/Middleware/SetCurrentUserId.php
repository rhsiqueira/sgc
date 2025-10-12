<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SetCurrentUserId
{
    
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()) {

            DB::statement('SET @current_user_id = ?', [$request->user()->id_usuario]);
        }
       return $next($request);
    }
}