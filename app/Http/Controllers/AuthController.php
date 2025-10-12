<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;     
use App\Models\Usuario;                  

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credenciais = $request->validate([
            'cpf'   => 'required|string',
            'senha' => 'required|string',
        ]);

        $cpfLimpo = preg_replace('/\D/', '', $credenciais['cpf']);

        $usuario = Usuario::where('cpf', $cpfLimpo)
            ->where('status', 'ATIVO')
            ->first();

        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Credenciais inválidas (usuário não encontrado ou inativo).'
            ], 401);
        }

        if (!Hash::check($credenciais['senha'], $usuario->senha_hash)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Credenciais inválidas (senha incorreta).'
            ], 401);
        }


        //$usuario->tokens()->delete();

        // 7) Gera um token Sanctum. Você pode definir "abilities/escopos" no segundo parâmetro.
        // Ex.: ['coletas:criar', 'clientes:ver'] de acordo com o perfil
        $token = $usuario->createToken('api-token', ['*'])->plainTextToken;

        // 8) Monta o payload de resposta com dados úteis do usuário e o token
        return response()->json([
            'status'  => 'success',
            'message' => 'Autenticado com sucesso.',
            'data'    => [
                'usuario' => [
                    'id_usuario'    => $usuario->id_usuario,
                    'nome_completo' => $usuario->nome_completo,
                    'email'         => $usuario->email,
                    'cpf'           => $usuario->cpf,
                    'id_perfil'     => $usuario->id_perfil,
                    'status'        => $usuario->status,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * POST /api/auth/logout
     * Revoga APENAS o token usado nesta requisição.
     * (Requer Bearer Token válido)
     */
    public function logout(Request $request)
    {
        // 1) Pega o token atual da requisição e deleta (revoga)
        $request->user()->currentAccessToken()->delete();

        // 2) Responde confirmação
        return response()->json([
            'status'  => 'success',
            'message' => 'Logout realizado. Token revogado.'
        ]);
    }

    /**
     * GET /api/auth/me
     * Retorna o usuário autenticado (útil para front verificar sessão).
     * (Requer Bearer Token válido)
     */
    public function me(Request $request)
    {
        // 1) Retorna o usuário que está “logado” via token Sanctum
        return response()->json([
            'status'  => 'success',
            'data'    => $request->user()
        ]);
    }
}