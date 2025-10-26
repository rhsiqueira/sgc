<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perfil;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    /**
     * 🔹 Lista todos os perfis com suas permissões
     */
    public function index()
    {
        $perfis = Perfil::with('permissoes')->get();
        return response()->json(['status' => 'success', 'data' => $perfis]);
    }

    /**
     * 🔹 Exibe um perfil específico
     */
    public function show($id)
    {
        $perfil = Perfil::with('permissoes')->find($id);
        if (!$perfil) {
            return response()->json(['status' => 'error', 'message' => 'Perfil não encontrado.'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $perfil]);
    }

    /**
     * 🔹 Cria um novo perfil (com ou sem permissões)
     */
    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_perfil' => 'required|string|max:50|unique:perfil,nome_perfil',
                'descricao' => 'nullable|string|max:250',
                'status' => 'in:ATIVO,INATIVO', // ✅ campo novo validado
                'permissoes' => 'array',
                'permissoes.*' => 'integer|exists:permissao,id_permissao',
            ]);

            // Cria o perfil
            $perfil = Perfil::create($dados);

            // Se tiver permissões, sincroniza com a tabela pivot
            if (!empty($dados['permissoes'])) {
                $perfil->permissoes()->sync($dados['permissoes']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Perfil criado com sucesso.',
                'data' => $perfil->load('permissoes'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao criar perfil: ' . $e->getMessage(),
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
            return response()->json(['status' => 'error', 'message' => 'Perfil não encontrado.'], 404);
        }

        try {
            $dados = $request->validate([
                'nome_perfil' => 'sometimes|required|string|max:50|unique:perfil,nome_perfil,' . $id . ',id_perfil',
                'descricao' => 'nullable|string|max:250',
                'status' => 'in:ATIVO,INATIVO', // ✅ campo novo validado
                'permissoes' => 'array',
                'permissoes.*' => 'integer|exists:permissao,id_permissao',
            ]);

            // Atualiza os dados básicos
            $perfil->update($dados);

            // Atualiza permissões vinculadas
            if (isset($dados['permissoes'])) {
                $perfil->permissoes()->sync($dados['permissoes']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Perfil atualizado com sucesso.',
                'data' => $perfil->load('permissoes'),
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro de validação.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🔹 Exclui um perfil
     */
    public function destroy($id)
    {
        $perfil = Perfil::find($id);
        if (!$perfil) {
            return response()->json(['status' => 'error', 'message' => 'Perfil não encontrado.'], 404);
        }

        try {
            $perfil->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Perfil excluído com sucesso.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir perfil: ' . $e->getMessage(),
            ], 500);
        }
    }
}
