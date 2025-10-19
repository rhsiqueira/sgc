<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $usuario = Auth::user();

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não autenticado.'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nome_completo' => $usuario->nome_completo,
                'email' => $usuario->email,
                'perfil' => optional($usuario->perfil)->nome_perfil ?? 'Sem perfil'
            ],
            'modulos' => [
                [ 'nome' => 'Usuários', 'rota' => '/usuarios' ],
                [ 'nome' => 'Clientes', 'rota' => '/clientes' ],
                [ 'nome' => 'Coletas', 'rota' => '/coletas' ],
                [ 'nome' => 'Produtos', 'rota' => '/produtos' ],
                [ 'nome' => 'Relatórios', 'rota' => '/relatorios' ],
                [ 'nome' => 'Auditoria', 'rota' => '/auditoria' ]
            ]
        ]);
    }
}
