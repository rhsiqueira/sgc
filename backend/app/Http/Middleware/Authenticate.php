<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Define o comportamento quando o usuário não está autenticado.
     * Em API, retornamos 401 JSON. Em Web, deixamos o fluxo padrão.
     */
    protected function redirectTo($request)
    {
        // Para API, nunca tente redirecionar: devolve 401 JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            abort(response()->json([
                'status'  => 'error',
                'message' => 'Não autenticado. Token inválido ou ausente.'
            ], 401));
        }

        // Em rotas web, se quiser poderia retornar uma view de login.
        // Se não retornar string, o Laravel não tenta redirecionar.
        return null;
    }
}
