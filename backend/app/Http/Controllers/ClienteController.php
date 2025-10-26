<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    /**
     * 🔹 Lista todos os clientes
     */
    public function index()
    {
        $clientes = Cliente::all();

        return response()->json([
            'status' => 'success',
            'message' => 'Clientes listados com sucesso.',
            'data' => $clientes
        ]);
    }

    /**
     * 🔹 Exibe um cliente específico
     */
    public function show($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cliente não encontrado.',
                'data' => null
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Cliente encontrado.',
            'data' => $cliente
        ]);
    }

    /**
     * 🔹 Cria um novo cliente
     */
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

            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'razao_social'       => 'required|string|max:100',
                'nome_fantasia'      => 'nullable|string|max:100',
                'cnpj_cpf'           => 'required|string|max:18|unique:cliente,cnpj_cpf',
                'endereco'           => 'nullable|string|max:150',
                'numero'             => 'nullable|string|max:10',
                'bairro'             => 'nullable|string|max:100',
                'cidade'             => 'nullable|string|max:100',
                'estado'             => 'nullable|string|max:2',
                'cep'                => 'nullable|string|max:10',
                'nome_responsavel'   => 'nullable|string|max:100',
                'email_comercial'    => 'nullable|email|max:100',
                'telefone_celular'   => 'nullable|string|max:20',
                'telefone_fixo'      => 'nullable|string|max:20',
                'dias_funcionamento' => 'nullable|string|max:100',
                'observacoes'        => 'nullable|string|max:200',
                'status'             => 'nullable|in:ATIVO,INATIVO',
            ]);

            $cliente = Cliente::create($dados);

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente criado com sucesso.',
                'data'    => $cliente
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
                'message' => 'Erro ao criar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Atualiza um cliente existente
     */
    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cliente não encontrado.'
            ], 404);
        }

        try {
            $usuario = auth()->user();
            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $dados = $request->validate([
                'razao_social'       => 'sometimes|required|string|max:100',
                'nome_fantasia'      => 'nullable|string|max:100',
                'cnpj_cpf'           => 'sometimes|required|string|max:18|unique:cliente,cnpj_cpf,' . $id . ',id_cliente',
                'endereco'           => 'nullable|string|max:150',
                'numero'             => 'nullable|string|max:10',
                'bairro'             => 'nullable|string|max:100',
                'cidade'             => 'nullable|string|max:100',
                'estado'             => 'nullable|string|max:2',
                'cep'                => 'nullable|string|max:10',
                'nome_responsavel'   => 'nullable|string|max:100',
                'email_comercial'    => 'nullable|email|max:100',
                'telefone_celular'   => 'nullable|string|max:20',
                'telefone_fixo'      => 'nullable|string|max:20',
                'dias_funcionamento' => 'nullable|string|max:100',
                'observacoes'        => 'nullable|string|max:200',
                'status'             => 'nullable|in:ATIVO,INATIVO'
            ]);

            $cliente->update($dados);

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente atualizado com sucesso.',
                'data'    => $cliente
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
                'message' => 'Erro ao atualizar cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exclui um cliente
     */
    public function destroy($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cliente não encontrado.'
            ], 404);
        }

        $usuario = auth()->user();
        DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

        try {
            $cliente->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente excluído com sucesso.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao excluir cliente: ' . $e->getMessage()
            ], 500);
        }
    }
}
