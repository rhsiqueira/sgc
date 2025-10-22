<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permissao;
use Illuminate\Validation\ValidationException;

class PermissaoController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => Permissao::all()]);
    }

    public function show($id)
    {
        $permissao = Permissao::find($id);
        if (!$permissao) {
            return response()->json(['status' => 'error', 'message' => 'Permissão não encontrada.'], 404);
        }
        return response()->json(['status' => 'success', 'data' => $permissao]);
    }

    public function store(Request $request)
    {
        try {
            $dados = $request->validate([
                'nome_modulo' => 'required|string|max:100',
                'acao' => 'required|in:I,E,A,C',
                'descricao' => 'nullable|string|max:255',
            ]);

            $permissao = Permissao::create($dados);
            return response()->json(['status' => 'success', 'message' => 'Permissão criada.', 'data' => $permissao], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => 'Erro de validação.', 'errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $permissao = Permissao::find($id);
        if (!$permissao) {
            return response()->json(['status' => 'error', 'message' => 'Permissão não encontrada.'], 404);
        }

        try {
            $dados = $request->validate([
                'nome_modulo' => 'sometimes|required|string|max:100',
                'acao' => 'sometimes|required|in:I,E,A,C',
                'descricao' => 'nullable|string|max:255',
            ]);

            $permissao->update($dados);
            return response()->json(['status' => 'success', 'message' => 'Permissão atualizada.', 'data' => $permissao]);
        } catch (ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => 'Erro de validação.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        $permissao = Permissao::find($id);
        if (!$permissao) {
            return response()->json(['status' => 'error', 'message' => 'Permissão não encontrada.'], 404);
        }

        $permissao->delete();
        return response()->json(['status' => 'success', 'message' => 'Permissão excluída.']);
    }
}
