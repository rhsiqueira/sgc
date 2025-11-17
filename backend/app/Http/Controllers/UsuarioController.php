<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    /**
     * 🔹 Lista todos os usuários
     * - Ordenados do mais recente para o mais antigo
     * - Permite filtrar por status (ATIVO | INATIVO | TODOS)
     */
    public function index(Request $request)
    {
        try {
            $status = $request->query('status'); // filtro opcional

            $usuarios = Usuario::with('perfil')
                ->when($status && $status !== 'TODOS', function ($q) use ($status) {
                    $q->where('status', $status);
                })
                ->orderBy('data_criacao', 'desc')
                ->orderBy('id_usuario', 'desc')
                ->get();

            return response()->json([
                'status'  => 'success',
                'message' => 'Usuários listados com sucesso.',
                'data'    => $usuarios
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao listar usuários: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Cria um novo usuário
     */
    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_completo' => 'required|string|max:255',
                'email'         => 'required|string|email|unique:usuario,email',
                'cpf'           => 'required|string|max:14|unique:usuario,cpf',
                'senha'         => 'required|string|min:6',
                'id_perfil'     => 'required|integer|exists:perfil,id_perfil'
            ]);

            $usuario = DB::transaction(function () use ($dados, $request) {
                $novoUsuario = Usuario::create([
                    'nome_completo' => $dados['nome_completo'],
                    'email'         => $dados['email'],
                    'cpf'           => $dados['cpf'],
                    'senha_hash'    => Hash::make($dados['senha']),
                    'id_perfil'     => $dados['id_perfil'],
                    'status'        => 'ATIVO',
                    'password_reset_required' => false,
                ]);

                DB::table('log_auditoria')->insert([
                    'id_usuario'      => $request->user()->id_usuario ?? null,
                    'tabela_afetada'  => 'usuario',
                    'registro_id'     => $novoUsuario->id_usuario,
                    'acao'            => 'INSERT',
                    'descricao'       => 'Usuário criado: ' . $novoUsuario->nome_completo,
                ]);

                return $novoUsuario;
            });

            // Retorna com perfil carregado
            $usuario->load('perfil');

            return response()->json([
                'status'  => 'success',
                'message' => 'Usuário criado com sucesso.',
                'data'    => $usuario
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro de validação.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao criar usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Atualiza dados de um usuário
     */
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        try {
            $dados = $request->validate([
                'nome_completo' => 'sometimes|string|max:255',
                'email'         => 'sometimes|string|email|unique:usuario,email,' . $id . ',id_usuario',
                'id_perfil'     => 'sometimes|integer|exists:perfil,id_perfil',
                'status'        => 'sometimes|in:ATIVO,INATIVO',
            ]);

            DB::transaction(function () use ($usuario, $dados, $request) {
                $usuario->update($dados);

                DB::table('log_auditoria')->insert([
                    'id_usuario'      => $request->user()->id_usuario ?? null,
                    'tabela_afetada'  => 'usuario',
                    'registro_id'     => $usuario->id_usuario,
                    'acao'            => 'UPDATE',
                    'descricao'       => 'Usuário atualizado: ' . $usuario->nome_completo,
                ]);
            });

            // Mantém consistência
            $usuario->load('perfil');

            return response()->json([
                'status'  => 'success',
                'message' => 'Usuário atualizado com sucesso.',
                'data'    => $usuario
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro de validação.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao atualizar usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Redefine senha
     */
    public function redefinirSenha(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuário não encontrado.',
                'data'    => null
            ], 404);
        }

        try {
            $dados = $request->validate([
                'nova_senha' => 'required|string|min:6'
            ]);

            $executor = $request->user();

            DB::transaction(function () use ($usuario, $dados, $executor) {
                $usuario->senha_hash = Hash::make($dados['nova_senha']);
                $usuario->tentativas_login = 0;
                $usuario->status = 'ATIVO';

                if ($executor && $executor->id_usuario === $usuario->id_usuario) {
                    $usuario->password_reset_required = false;
                } else {
                    $usuario->password_reset_required = true;
                }

                $usuario->save();

                DB::table('log_auditoria')->insert([
                    'id_usuario'      => $executor->id_usuario ?? null,
                    'tabela_afetada'  => 'usuario',
                    'registro_id'     => $usuario->id_usuario,
                    'acao'            => 'UPDATE',
                    'descricao'       => sprintf(
                        'Senha redefinida por "%s" (%d) para "%s" (%d).',
                        $executor->nome_completo ?? 'Sistema',
                        $executor->id_usuario ?? 0,
                        $usuario->nome_completo,
                        $usuario->id_usuario
                    ),
                ]);
            });

            $usuario->load('perfil');

            return response()->json([
                'status'  => 'success',
                'message' => $executor && $executor->id_usuario === $usuario->id_usuario
                    ? 'Senha redefinida com sucesso.'
                    : 'Senha redefinida com sucesso. O usuário precisará alterá-la no próximo login.',
                'data' => $usuario
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro de validação.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao redefinir senha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exclui um usuário
     */
    public function destroy(Request $request, $id)
    {
        $usuario = Usuario::find($id);

        if (!$usuario) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuário não encontrado.',
            ], 404);
        }

        try {
            DB::transaction(function () use ($usuario, $request) {
                $usuario->delete();

                DB::table('log_auditoria')->insert([
                    'id_usuario'      => $request->user()->id_usuario ?? null,
                    'tabela_afetada'  => 'usuario',
                    'registro_id'     => $usuario->id_usuario,
                    'acao'            => 'DELETE',
                    'descricao'       => 'Usuário excluído: ' . $usuario->nome_completo,
                ]);
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Usuário removido com sucesso.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao excluir usuário: ' . $e->getMessage()
            ], 500);
        }
    }
}
