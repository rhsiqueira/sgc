<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Define o comportamento quando o usuário não está autenticado.
     * O Laravel normalmente tenta redirecionar para uma rota "login",
     * mas como estamos usando API, retornamos uma resposta JSON 401.
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            abort(response()->json([
                'status' => 'error',
                'message' => 'Não autenticado. Token inválido ou ausente.'
            ], 401));
        }
    }
}
