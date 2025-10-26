<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    /**
     * Lista todos os usuários
     */
    public function index()
    {
        $usuarios = Usuario::with('perfil')->get();
        return response()->json($usuarios);
    }

    /**
     * Cria um novo usuário
     */
    public function store(Request $request)
    {
        $dados = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'email' => 'required|string|email|unique:usuario,email',
            'cpf' => 'required|string|max:14|unique:usuario,cpf',
            'senha' => 'required|string|min:6',
            'id_perfil' => 'required|integer|exists:perfil,id_perfil'
        ]);

        return DB::transaction(function () use ($dados, $request) {
            $usuario = Usuario::create([
                'nome_completo' => $dados['nome_completo'],
                'email' => $dados['email'],
                'cpf' => $dados['cpf'],
                'senha_hash' => Hash::make($dados['senha']),
                'id_perfil' => $dados['id_perfil'],
                'status' => 'ATIVO',
                'password_reset_required' => false,
            ]);

            DB::table('log_auditoria')->insert([
                'id_usuario' => $request->user()->id_usuario ?? null,
                'tabela_afetada' => 'usuario',
                'registro_id' => $usuario->id_usuario,
                'acao' => 'INSERT',
                'descricao' => 'Usuário criado: ' . $usuario->nome_completo
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário criado com sucesso!',
                'usuario' => $usuario
            ]);
        });
    }

    /**
     * Atualiza dados de um usuário
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'message' => 'Usuário não encontrado.'], 404);
        }

        $dados = $request->validate([
            'nome_completo' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:usuario,email,' . $id . ',id_usuario',
            'id_perfil' => 'sometimes|integer|exists:perfil,id_perfil',
            'status' => 'sometimes|in:ATIVO,INATIVO',
        ]);

        return DB::transaction(function () use ($usuario, $dados, $request) {
            $usuario->update($dados);

            DB::table('log_auditoria')->insert([
                'id_usuario' => $request->user()->id_usuario ?? null,
                'tabela_afetada' => 'usuario',
                'registro_id' => $usuario->id_usuario,
                'acao' => 'UPDATE',
                'descricao' => 'Usuário atualizado: ' . $usuario->nome_completo
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário atualizado com sucesso!',
                'usuario' => $usuario
            ]);
        });
    }

    /**
     * Redefine senha — ajusta flag de troca obrigatória conforme o contexto
     */
    public function redefinirSenha(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuário não encontrado.'
            ], 404);
        }

        $dados = $request->validate([
            'nova_senha' => 'required|string|min:6'
        ]);

        $executor = $request->user();

        try {
            return DB::transaction(function () use ($usuario, $dados, $executor) {
                $usuario->senha_hash = Hash::make($dados['nova_senha']);
                $usuario->tentativas_login = 0;
                $usuario->status = 'ATIVO';

                // 🔍 Ajuste inteligente:
                // Se o próprio usuário redefinir sua senha → não exige troca novamente
                // Se outro (admin) redefinir → marca troca obrigatória
                if ($executor && $executor->id_usuario === $usuario->id_usuario) {
                    $usuario->password_reset_required = false;
                } else {
                    $usuario->password_reset_required = true;
                }

                $usuario->save();

                DB::table('log_auditoria')->insert([
                    'id_usuario' => $executor->id_usuario ?? null,
                    'tabela_afetada' => 'usuario',
                    'registro_id' => $usuario->id_usuario,
                    'acao' => 'UPDATE',
                    'descricao' => sprintf(
                        'Senha redefinida por "%s" (%d) para "%s" (%d).',
                        $executor->nome_completo ?? 'Sistema',
                        $executor->id_usuario ?? 0,
                        $usuario->nome_completo,
                        $usuario->id_usuario
                    ),
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => $executor && $executor->id_usuario === $usuario->id_usuario
                        ? 'Senha redefinida com sucesso.'
                        : 'Senha redefinida com sucesso. O usuário precisará alterá-la no próximo login.'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao redefinir senha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exclui um usuário
     */
    public function destroy(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json(['status' => 'error', 'message' => 'Usuário não encontrado.'], 404);
        }

        return DB::transaction(function () use ($usuario, $request) {
            $usuario->delete();

            DB::table('log_auditoria')->insert([
                'id_usuario' => $request->user()->id_usuario ?? null,
                'tabela_afetada' => 'usuario',
                'registro_id' => $usuario->id_usuario,
                'acao' => 'DELETE',
                'descricao' => 'Usuário excluído: ' . $usuario->nome_completo
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuário removido com sucesso.'
            ]);
        });
    }
}
