<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsurePerfil
{
    /**
     * Middleware que garante que o usuário autenticado possua permissão
     * para o módulo e ação informados.
     *
     * Exemplo de uso na rota:
     *   ->middleware('perfil:USUARIO,C')
     *   ->middleware('perfil:CLIENTE,I')
     */
    public function handle(Request $request, Closure $next, $modulo, $acao)
    {
        // 🚫 Ignora o middleware para rotas públicas e de autenticação
        if ($request->is('api/auth/*') || $request->is('api/health')) {
            return $next($request);
        }

        try {
            $usuario = $request->user();

            // 🔐 1. Verifica autenticação
            if (!$usuario) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Usuário não autenticado.'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // 🔍 2. Carrega o perfil com as permissões
            $perfil = $usuario->perfil()->with('permissoes')->first();

            if (!$perfil) {
                Log::warning("Usuário {$usuario->id_usuario} sem perfil vinculado.");
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Perfil do usuário não encontrado.'
                ], Response::HTTP_FORBIDDEN);
            }

            // 🔎 3. Verifica se há permissão correspondente ao módulo e ação
            $temPermissao = $perfil->permissoes->contains(function ($p) use ($modulo, $acao) {
                return strtoupper($p->nome_modulo) === strtoupper($modulo)
                    && strtoupper($p->acao) === strtoupper($acao);
            });

            if (!$temPermissao) {
                Log::info("Acesso negado para usuário {$usuario->id_usuario} ({$usuario->nome_completo}) — módulo {$modulo}, ação {$acao}");
                return response()->json([
                    'status'  => 'error',
                    'message' => "Acesso negado. O perfil \"{$perfil->nome_perfil}\" não possui permissão para {$acao} em {$modulo}.",
                ], Response::HTTP_FORBIDDEN);
            }

            // ✅ 4. Permite continuar
            return $next($request);

        } catch (\Throwable $e) {
            Log::error("Erro no EnsurePerfil: {$e->getMessage()}", [
                'rota' => $request->path(),
                'usuario' => optional($request->user())->id_usuario,
                'modulo' => $modulo,
                'acao' => $acao,
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro interno ao validar permissões.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
