<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produto;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ProdutoController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => Produto::all()]);
    }

    public function show($id)
    {
        $produto = Produto::find($id);
        if (!$produto)
            return response()->json(['status' => 'error', 'message' => 'Produto não encontrado.'], 404);

        return response()->json(['status' => 'success', 'data' => $produto]);
    }

    public function store(Request $request)
    {
        try {
            $usuario = auth()->user();
            if (!$usuario) {
                return response()->json(['status' => 'error', 'message' => 'Usuário não autenticado.'], 401);
            }

            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'nome_produto' => 'required|string|max:100|unique:produto,nome_produto',
                'unidade' => 'nullable|string|max:20',
                'quantidade_atual' => 'required|numeric|min:0',
                'quantidade_minima' => 'required|numeric|min:0',
                'valor_custo' => 'required|numeric|min:0',
                'valor_venda' => 'required|numeric|min:0',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            $produto = Produto::create($dados);

            return response()->json(['status' => 'success', 'message' => 'Produto criado com sucesso.', 'data' => $produto], 201);
        } catch (ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => 'Erro de validação.', 'errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $produto = Produto::find($id);
        if (!$produto)
            return response()->json(['status' => 'error', 'message' => 'Produto não encontrado.'], 404);

        try {
            $usuario = auth()->user();
            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'nome_produto' => 'sometimes|required|string|max:100|unique:produto,nome_produto,' . $id . ',id_produto',
                'unidade' => 'nullable|string|max:20',
                'quantidade_atual' => 'sometimes|required|numeric|min:0',
                'quantidade_minima' => 'sometimes|required|numeric|min:0',
                'valor_custo' => 'sometimes|required|numeric|min:0',
                'valor_venda' => 'sometimes|required|numeric|min:0',
                'status' => 'nullable|in:ATIVO,INATIVO'
            ]);

            $produto->update($dados);

            return response()->json(['status' => 'success', 'message' => 'Produto atualizado com sucesso.', 'data' => $produto]);
        } catch (ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => 'Erro de validação.', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        $produto = Produto::find($id);
        if (!$produto)
            return response()->json(['status' => 'error', 'message' => 'Produto não encontrado.'], 404);

        $usuario = auth()->user();
        DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

        $produto->delete();

        return response()->json(['status' => 'success', 'message' => 'Produto excluído com sucesso.']);
    }
}
