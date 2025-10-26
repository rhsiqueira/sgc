<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

class AuthController extends Controller
{
    /**
     * 🔐 POST /api/auth/login
     * Faz a autenticação do usuário via CPF e senha.
     * Após 3 tentativas incorretas, o usuário é bloqueado automaticamente.
     */
    public function login(Request $request)
    {
        $credenciais = $request->validate([
            'cpf'   => 'required|string',
            'senha' => 'required|string',
        ]);

        // Limpa o CPF (remove pontos e traços)
        $cpfLimpo = preg_replace('/\D/', '', $credenciais['cpf']);

        // 🔹 Busca o usuário no banco
        $usuario = Usuario::where('cpf', $cpfLimpo)->first();

        // 🚫 Caso não encontre o usuário
        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Credenciais inválidas (usuário não encontrado).'
            ], 401);
        }

        // 🚫 Caso o usuário esteja bloqueado
        if ($usuario->status !== 'ATIVO') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Conta bloqueada. Contate o suporte.'
            ], 403);
        }

        // 🔐 Verifica a senha
        if (!Hash::check($credenciais['senha'], $usuario->senha_hash)) {

            // Incrementa tentativas
            $usuario->increment('tentativas_login');

            // Se atingiu 3 tentativas → bloqueia o usuário
            if ($usuario->tentativas_login >= 3) {
                $usuario->update(['status' => 'INATIVO']);
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Conta bloqueada após 3 tentativas incorretas. Contate o suporte.'
                ], 403);
            }

            return response()->json([
                'status'  => 'error',
                'message' => 'Senha incorreta. Tentativa ' . $usuario->tentativas_login . ' de 3.'
            ], 401);
        }

        // ✅ Login bem-sucedido → zera tentativas
        $usuario->update(['tentativas_login' => 0]);

        // Gera token Sanctum
        $token = $usuario->createToken('api-token', ['*'])->plainTextToken;

        // ✅ Retorna também a flag "password_reset_required"
        return response()->json([
            'status'  => 'success',
            'message' => 'Autenticado com sucesso.',
            'token'   => $token,
            'token_type' => 'Bearer',
            'usuario' => [
                'id_usuario'              => $usuario->id_usuario,
                'nome_completo'           => $usuario->nome_completo,
                'email'                   => $usuario->email,
                'cpf'                     => $usuario->cpf,
                'id_perfil'               => $usuario->id_perfil,
                'status'                  => $usuario->status,
                'password_reset_required' => (bool) $usuario->password_reset_required, // ✅ novo campo
            ]
        ], 200);
    }

    /**
     * 🚪 POST /api/auth/logout
     * Revoga o token usado nesta requisição (Bearer Token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout realizado. Token revogado.'
        ]);
    }

    /**
     * 👤 GET /api/auth/me
     * Retorna os dados do usuário autenticado.
     */
    public function me(Request $request)
    {
        $usuario = $request->user();

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        // ✅ Retorna dados incluindo a flag de troca obrigatória
        return response()->json([
            'status' => 'success',
            'data'   => [
                'id_usuario'              => $usuario->id_usuario,
                'nome_completo'           => $usuario->nome_completo,
                'email'                   => $usuario->email,
                'cpf'                     => $usuario->cpf,
                'id_perfil'               => $usuario->id_perfil,
                'status'                  => $usuario->status,
                'password_reset_required' => (bool) $usuario->password_reset_required, // ✅ novo campo
            ]
        ]);
    }
}
