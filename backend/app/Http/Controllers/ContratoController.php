<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contrato;
use App\Models\Cliente;
use App\Models\LogAuditoria;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ContratoController extends Controller
{
    /**
     * 🔹 Lista todos os contratos (mais recentes primeiro)
     */
    public function index()
    {
        $contratos = Contrato::with('cliente')
            ->orderBy('data_upload', 'DESC')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Contratos listados com sucesso.',
            'data' => $contratos
        ]);
    }

    /**
     * 🔹 Exibe um contrato específico
     */
    public function show($id)
    {
        $contrato = Contrato::with('cliente')->find($id);

        if (!$contrato) {
            return response()->json([
                'status' => 'error',
                'message' => 'Contrato não encontrado.',
                'data' => null
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Contrato encontrado.',
            'data' => $contrato
        ]);
    }

    /**
     * 🔹 Faz o upload e cria um novo contrato
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

            $dados = $request->validate([
                'id_cliente' => 'required|integer|exists:cliente,id_cliente',
                'arquivo'    => 'required|file|mimes:pdf|max:10240', // 10MB
            ]);

            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $cliente = Cliente::findOrFail($dados['id_cliente']);

            // 🔹 Prepara nome da pasta
            $nomePasta = preg_replace(
                '/[^A-Za-z0-9_\-]/',
                '_',
                $cliente->nome_fantasia ?? $cliente->razao_social
            );

            Storage::disk('public')->makeDirectory("contratos/{$nomePasta}");

            // 🔹 Processa arquivo
            $arquivo = $request->file('arquivo');
            $nomeArquivo = time() . '_' . $arquivo->getClientOriginalName();

            $path = $arquivo->storeAs("contratos/{$nomePasta}", $nomeArquivo, 'public');

            // 🔹 Cria o contrato
            $contrato = Contrato::create([
                'id_cliente'     => $cliente->id_cliente,
                'url_arquivo'    => $path,
                'usuario_upload' => $usuario->nome_completo ?? 'Sistema',
                'data_upload'    => now(),
            ]);

            // 🔥 Auditoria
            LogAuditoria::create([
                'id_usuario'     => $usuario->id_usuario,
                'tabela_afetada' => 'contrato',
                'registro_id'    => $contrato->id_contrato,
                'acao'           => 'INSERT',
                'descricao'      => 'Contrato criado com upload de arquivo.',
                'detalhes'       => json_encode([
                    'id_cliente'   => $cliente->id_cliente,
                    'arquivo'      => $nomeArquivo,
                    'path'         => $path
                ])
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Contrato enviado e salvo com sucesso.',
                'data'    => $contrato
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
                'message' => 'Erro ao enviar contrato: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Atualiza/substitui o arquivo de um contrato existente
     */
    public function update(Request $request, $id)
    {
        $contrato = Contrato::find($id);
        if (!$contrato) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Contrato não encontrado.',
                'data'    => null
            ], 404);
        }

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
                'arquivo'        => 'sometimes|file|mimes:pdf|max:10240',
                'usuario_upload' => 'nullable|string|max:100'
            ]);

            $antes = $contrato->replicate();

            if ($request->hasFile('arquivo')) {
                // 🔹 Remove arquivo antigo
                if ($contrato->url_arquivo && Storage::disk('public')->exists($contrato->url_arquivo)) {
                    Storage::disk('public')->delete($contrato->url_arquivo);
                }

                // 🔹 Mesma lógica do store()
                $cliente = $contrato->cliente;
                $nomePasta = preg_replace('/[^A-Za-z0-9_\-]/', '_', $cliente->nome_fantasia ?? $cliente->razao_social);

                Storage::disk('public')->makeDirectory("contratos/{$nomePasta}");

                $arquivo = $request->file('arquivo');
                $nomeArquivo = time() . '_' . $arquivo->getClientOriginalName();
                $path = $arquivo->storeAs("contratos/{$nomePasta}", $nomeArquivo, 'public');

                $contrato->url_arquivo = $path;
                $contrato->data_upload = now();
            }

            $contrato->usuario_upload = $usuario->nome_completo;
            $contrato->save();

            // 🔥 Auditoria
            LogAuditoria::create([
                'id_usuario'     => $usuario->id_usuario,
                'tabela_afetada' => 'contrato',
                'registro_id'    => $contrato->id_contrato,
                'acao'           => 'UPDATE',
                'descricao'      => 'Contrato atualizado (arquivo substituído).',
                'detalhes'       => json_encode([
                    'antes' => $antes,
                    'depois' => $contrato
                ])
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Contrato atualizado com sucesso.',
                'data'    => $contrato
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
                'message' => 'Erro ao atualizar contrato: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Exclui um contrato e remove o arquivo físico
     */
    public function destroy($id)
    {
        $contrato = Contrato::find($id);
        if (!$contrato) {
            return response()->json([
                'status' => 'error',
                'message' => 'Contrato não encontrado.',
                'data' => null
            ], 404);
        }

        try {
            $usuario = auth()->user();
            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuário não autenticado.'
                ], 401);
            }

            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $antes = $contrato->replicate();

            if ($contrato->url_arquivo && Storage::disk('public')->exists($contrato->url_arquivo)) {
                Storage::disk('public')->delete($contrato->url_arquivo);
            }

            $contrato->delete();

            // 🔥 Auditoria
            LogAuditoria::create([
                'id_usuario'     => $usuario->id_usuario,
                'tabela_afetada' => 'contrato',
                'registro_id'    => $antes->id_contrato,
                'acao'           => 'DELETE',
                'descricao'      => 'Contrato excluído.',
                'detalhes'       => json_encode($antes)
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Contrato excluído com sucesso.',
                'data'    => null
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao excluir contrato: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔹 Lista contratos de um cliente específico
     */
    public function listarPorCliente($idCliente)
    {
        $cliente = Cliente::find($idCliente);

        if (!$cliente) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cliente não encontrado.',
                'data' => null
            ], 404);
        }

        $contratos = Contrato::where('id_cliente', $idCliente)
            ->orderBy('data_upload', 'DESC')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Contratos do cliente listados com sucesso.',
            'data' => $contratos
        ]);
    }
}
