<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    /**
     * 🔹 Lista todos os perfis com suas permissões
     * - Ordenados do mais recente para o mais antigo
     * - Permite filtrar por status (ATIVO | INATIVO | TODOS)
     */
    public function index(Request $request)
    {
        try {
            $status = $request->query('status'); // filtro opcional

            $perfis = Perfil::with('permissoes')
                ->when($status && $status !== 'TODOS', function ($q) use ($status) {
                    $q->where('status', $status);
                })
                ->orderBy('data_criacao', 'desc')
                ->orderBy('id_perfil', 'desc')
                ->get();

            return response()->json([
                'status'  => 'success',
                'message' => 'Perfis listados com sucesso.',
                'data'    => $perfis
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao listar perfis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exibe um perfil específico
     */
    public function show($id)
    {
        try {
            $perfil = Perfil::with('permissoes')->find($id);

            if (!$perfil) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Perfil não encontrado.',
                    'data'    => null
                ], 404);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Perfil encontrado com sucesso.',
                'data'    => $perfil
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao buscar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Cria um novo perfil (com ou sem permissões)
     */
    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_perfil'  => 'required|string|max:50|unique:perfil,nome_perfil',
                'descricao'    => 'nullable|string|max:250',
                'status'       => 'in:ATIVO,INATIVO',
                'permissoes'   => 'array',
                'permissoes.*' => 'integer|exists:permissao,id_permissao',
            ]);

            $perfil = DB::transaction(function () use ($dados, $request) {

                // Criar
                $novoPerfil = Perfil::create([
                    'nome_perfil' => $dados['nome_perfil'],
                    'descricao'   => $dados['descricao'] ?? null,
                    'status'      => $dados['status'] ?? 'ATIVO',
                ]);

                // Vincular permissões
                if (!empty($dados['permissoes'])) {
                    $novoPerfil->permissoes()->sync($dados['permissoes']);
                }

                // Recarregar
                $novoPerfil->refresh();

                // 🟢 AUDITORIA — INSERT
                DB::table('log_auditoria')->insert([
                    'id_usuario'     => $request->user()->id_usuario ?? null,
                    'tabela_afetada' => 'perfil',
                    'registro_id'    => $novoPerfil->id_perfil,
                    'acao'           => 'INSERT',
                    'descricao'      => 'Perfil criado: ' . $novoPerfil->nome_perfil,
                    'detalhes'       => json_encode([
                        'dados_recebidos' => $dados
                    ]),
                ]);

                return $novoPerfil->load('permissoes');
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Perfil criado com sucesso.',
                'data'    => $perfil
            ], 201);

        } catch (ValidationException $e) {

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro de validação.',
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao criar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Atualiza um perfil existente (com ou sem permissões)
     */
    public function update(Request $request, $id)
    {
        $perfil = Perfil::find($id);

        if (!$perfil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Perfil não encontrado.',
                'data'    => null
            ], 404);
        }

        try {
            $dados = $request->validate([
                'nome_perfil'  => 'sometimes|required|string|max:50|unique:perfil,nome_perfil,' . $id . ',id_perfil',
                'descricao'    => 'nullable|string|max:250',
                'status'       => 'in:ATIVO,INATIVO',
                'permissoes'   => 'array',
                'permissoes.*' => 'integer|exists:permissao,id_permissao',
            ]);

            $perfil = DB::transaction(function () use ($perfil, $dados, $request) {

                // Salvar estado anterior
                $antes = $perfil->toArray();

                // Atualizar
                $perfil->update([
                    'nome_perfil' => $dados['nome_perfil'] ?? $perfil->nome_perfil,
                    'descricao'   => $dados['descricao'] ?? $perfil->descricao,
                    'status'      => $dados['status'] ?? $perfil->status,
                ]);

                // Sincronizar permissões, se enviadas
                if (isset($dados['permissoes'])) {
                    $perfil->permissoes()->sync($dados['permissoes']);
                }

                // Recarregar para pegar valores atualizados
                $perfil->refresh();

                // 🔵 AUDITORIA — UPDATE
                DB::table('log_auditoria')->insert([
                    'id_usuario'     => $request->user()->id_usuario ?? null,
                    'tabela_afetada' => 'perfil',
                    'registro_id'    => $perfil->id_perfil,
                    'acao'           => 'UPDATE',
                    'descricao'      => 'Perfil atualizado: ' . $perfil->nome_perfil,
                    'detalhes'       => json_encode([
                        'antes'  => $antes,
                        'depois' => $dados
                    ]),
                ]);

                return $perfil->load('permissoes');
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Perfil atualizado com sucesso.',
                'data'    => $perfil
            ]);

        } catch (ValidationException $e) {

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro de validação.',
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exclui um perfil
     */
    public function destroy(Request $request, $id)
    {
        $perfil = Perfil::find($id);

        if (!$perfil) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Perfil não encontrado.',
                'data'    => null
            ], 404);
        }

        try {
            // Capturar estado anterior
            $antes = $perfil->toArray();

            $perfil->delete();

            // 🔴 AUDITORIA — DELETE
            DB::table('log_auditoria')->insert([
                'id_usuario'     => $request->user()->id_usuario ?? null,
                'tabela_afetada' => 'perfil',
                'registro_id'    => $id,
                'acao'           => 'DELETE',
                'descricao'      => 'Perfil excluído: ' . $antes['nome_perfil'],
                'detalhes'       => json_encode([
                    'registro_anterior' => $antes
                ]),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Perfil excluído com sucesso.',
                'data'    => null
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao excluir perfil: ' . $e->getMessage()
            ], 500);
        }
    }
}
