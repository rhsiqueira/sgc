<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePerfil
{
    /**
     * Este middleware permite restringir acesso a rotas com base no id_perfil do usuário.
     * 
     * Exemplo de uso na rota:
     *   ->middleware('perfil:1,2')
     *     => Permite perfis 1 e 2
     */
    public function handle(Request $request, Closure $next, ...$perfisPermitidos)
    {
        // 🔐 Garante que há um usuário autenticado
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        // 🚫 Se o perfil do usuário NÃO estiver entre os perfis permitidos da rota:
        if (!in_array((string)$user->id_perfil, array_map('strval', $perfisPermitidos), true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Acesso negado. Seu perfil não possui permissão.'
            ], 403);
        }

        // ✅ Se tudo certo, segue o fluxo normal
        return $next($request);
    }
}
