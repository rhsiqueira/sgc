<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Coleta;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ColetaController extends Controller
{
    public function index()
    {
        return response()->json(['status' => 'success', 'data' => Coleta::all()]);
    }

    public function show($id)
    {
        $coleta = Coleta::find($id);
        if (!$coleta)
            return response()->json(['status' => 'error', 'message' => 'Coleta não encontrada.'], 404);

        return response()->json(['status' => 'success', 'data' => $coleta]);
    }

    public function store(Request $request)
    {
        try {
            $usuario = auth()->user();

            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuário não autenticado.'
                ], 401);
            }

            // Define o usuário logado para as triggers de auditoria
            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'id_cliente' => 'required|integer|exists:cliente,id_cliente',
                'data_coleta' => 'nullable|date',
                'quantidade_total' => 'required|numeric|min:0',
                'status' => 'nullable|in:PENDENTE,EM_ANDAMENTO,CONCLUIDA,CANCELADA',
                'observacao' => 'nullable|string|max:255'
            ]);

            // Cria a coleta associando automaticamente o id_usuario autenticado
            $coleta = Coleta::create([
                'id_cliente' => $dados['id_cliente'],
                'id_usuario' => $usuario->id_usuario,
                'data_coleta' => $dados['data_coleta'] ?? now(),
                'quantidade_total' => $dados['quantidade_total'],
                'status' => $dados['status'] ?? 'CONCLUIDA',
                'observacao' => $dados['observacao'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Coleta criada com sucesso.',
                'data' => $coleta
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $coleta = Coleta::find($id);
        if (!$coleta)
            return response()->json(['status' => 'error', 'message' => 'Coleta não encontrada.'], 404);

        try {
            $usuario = auth()->user();
            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'id_cliente' => 'sometimes|required|integer|exists:cliente,id_cliente',
                'data_coleta' => 'sometimes|required|date',
                'quantidade_total' => 'sometimes|required|numeric|min:0',
                'status' => 'nullable|in:PENDENTE,EM_ANDAMENTO,CONCLUIDA,CANCELADA',
                'observacao' => 'nullable|string|max:255'
            ]);

            $coleta->update($dados);

            return response()->json([
                'status' => 'success',
                'message' => 'Coleta atualizada com sucesso.',
                'data' => $coleta
            ]);

        } catch (ValidationException $e) {
            return response()->json(['status' => 'error', 'errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        $coleta = Coleta::find($id);
        if (!$coleta)
            return response()->json(['status' => 'error', 'message' => 'Coleta não encontrada.'], 404);

        $usuario = auth()->user();
        DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

        $coleta->delete();

        return response()->json(['status' => 'success', 'message' => 'Coleta excluída com sucesso.']);
    }
}
