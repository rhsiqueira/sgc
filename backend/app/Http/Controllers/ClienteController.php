<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class ClienteController extends Controller
{
    /**
     * 🔹 Lista os clientes com filtro, ordenação e contrato vinculado
     */
    public function index(Request $request)
    {
        try {
            $status = $request->query('status');   // ATIVO | INATIVO | vazio = TODOS
            $busca  = trim($request->query('busca', ''));

            $query = Cliente::with('contrato');

            // 🔍 Filtro de status
            if ($status && in_array($status, ['ATIVO', 'INATIVO'])) {
                $query->where('status', $status);
            }

            // 🔍 Busca geral
            if (!empty($busca)) {
                $query->where(function ($q) use ($busca) {
                    $buscaLower = strtolower($busca);
                    $q->whereRaw('LOWER(razao_social) LIKE ?', ["%{$buscaLower}%"])
                        ->orWhereRaw('LOWER(nome_fantasia) LIKE ?', ["%{$buscaLower}%"])
                        ->orWhere('cnpj_cpf', 'LIKE', "%{$busca}%");
                });
            }

            // 📌 Ordenação — mais recente primeiro
            $query->orderBy('data_criacao', 'DESC');

            $clientes = $query->get();

            return response()->json([
                'status'  => 'success',
                'message' => 'Clientes listados com sucesso.',
                'data'    => $clientes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao listar clientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exibe um cliente específico
     */
    public function show($id)
    {
        $cliente = Cliente::with('contrato')->find($id);

        if (!$cliente) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cliente não encontrado.',
                'data'    => null
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Cliente encontrado.',
            'data'    => $cliente
        ]);
    }

    /**
     * 🔹 Cria um novo cliente + AUDITORIA
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

            $cliente = DB::transaction(function () use ($dados, $usuario) {
                // Criação do cliente
                $novo = Cliente::create($dados);

                // 🔥 Auditoria
                DB::table('log_auditoria')->insert([
                    'id_usuario'     => $usuario->id_usuario,
                    'tabela_afetada' => 'cliente',
                    'registro_id'    => $novo->id_cliente,
                    'acao'           => 'INSERT',
                    'descricao'      => 'Criação de cliente',
                    'detalhes'       => json_encode($dados),
                ]);

                return $novo;
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente criado com sucesso.',
                'data'    => $cliente->fresh('contrato')
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
     * 🔹 Atualiza cliente + AUDITORIA
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

            $clienteAtualizado = DB::transaction(function () use ($cliente, $dados, $usuario) {
                $cliente->update($dados);

                // 🔥 Auditoria
                DB::table('log_auditoria')->insert([
                    'id_usuario'     => $usuario->id_usuario,
                    'tabela_afetada' => 'cliente',
                    'registro_id'    => $cliente->id_cliente,
                    'acao'           => 'UPDATE',
                    'descricao'      => 'Atualização de cliente',
                    'detalhes'       => json_encode($dados),
                ]);

                return $cliente->fresh('contrato');
            });

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente atualizado com sucesso.',
                'data'    => $clienteAtualizado
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
     * 🔹 Exclui cliente + AUDITORIA
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
            DB::transaction(function () use ($cliente, $usuario) {
                $detalhes = $cliente->toArray();

                $cliente->delete();

                DB::table('log_auditoria')->insert([
                    'id_usuario'     => $usuario->id_usuario,
                    'tabela_afetada' => 'cliente',
                    'registro_id'    => $detalhes['id_cliente'],
                    'acao'           => 'DELETE',
                    'descricao'      => 'Exclusão de cliente',
                    'detalhes'       => json_encode($detalhes),
                ]);
            });

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
