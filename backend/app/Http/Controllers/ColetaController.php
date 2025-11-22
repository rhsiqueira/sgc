<?php

namespace App\Http\Controllers;

use App\Models\Coleta;
use App\Models\ColetaCompensacao;
use App\Models\ColetaProduto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ColetaController extends Controller
{
    /**
     * LISTAR TODAS AS COLETAS (COM RELACIONAMENTOS PARA EDIÇÃO)
     */
    public function index()
    {
        $coletas = Coleta::with([
            'cliente',
            'usuario',
            'compensacoes.tipo',
            'produtos.produto',
        ])
            ->orderBy('data_coleta', 'desc')
            ->orderBy('id_coleta', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $coletas,
        ], 200);
    }

    /**
     * CRIAR NOVA COLETA
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            // ✅ Sempre pega o usuário autenticado
            $usuario = auth()->user();
            if (!$usuario) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Usuário não autenticado.',
                ], 401);
            }

            // ✅ Alimenta variável usada pelas TRIGGERS (auditoria / estoque)
            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            // ✅ Validação base (mantendo o que já funcionava)
            $request->validate([
                'id_cliente'  => 'required|integer',
                'data_coleta' => 'required|date',
                'status'      => 'required|string',
                'observacao'  => 'nullable|string',
                'tipos'       => 'nullable|array',
            ]);

            // ✅ Cria a coleta principal
            $coleta = Coleta::create([
                'id_cliente'       => $request->id_cliente,
                'id_usuario'       => $usuario->id_usuario,
                'data_coleta'      => $request->data_coleta,
                'status'           => $request->status,
                'observacao'       => $request->observacao,
                'quantidade_total' => 0,
                'data_criacao'     => now(),
                'data_atualizacao' => now(),
            ]);

            $totalLitros = 0;

            /**
             * ✅ Processa cada tipo de compensação vindo do front
             * Estrutura do front:
             * tipos: [
             *   { tipo: "pix" | "credito", quantidade, valor_unitario },
             *   { tipo: "produto", quantidade_oleo, produtos: [{id_produto, quantidade, ...}] }
             * ]
             */
            foreach ($request->tipos ?? [] as $tipo) {

                // -------------------------------------------------
                // PIX / CRÉDITO  → vai para coleta_compensacao
                // -------------------------------------------------
                if ($tipo['tipo'] === 'pix' || $tipo['tipo'] === 'credito') {

                    $quantidade = (float) ($tipo['quantidade'] ?? 0);
                    $valorUnit  = (float) ($tipo['valor_unitario'] ?? 0);

                    if ($quantidade > 0) {
                        $totalLitros += $quantidade;

                        ColetaCompensacao::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_tipo'        => $tipo['tipo'] === 'pix' ? 1 : 2,
                            'quantidade'     => $quantidade,
                            'valor_unitario' => $valorUnit,
                            'observacao'     => $tipo['observacao'] ?? null,
                            'data_registro'  => now(),
                            // ❗ NÃO passamos valor_total (trigger/coluna cuida disso)
                        ]);
                    }
                }

                // -------------------------------------------------
                // PRODUTO  → gera compensação tipo PRODUTO + itens em coleta_produto
                // -------------------------------------------------
                if ($tipo['tipo'] === 'produto') {

                    $quantidadeOleo = (float) ($tipo['quantidade_oleo'] ?? 0);
                    $produtos       = $tipo['produtos'] ?? [];

                    if ($quantidadeOleo > 0) {
                        // ✅ Soma litros ao total
                        $totalLitros += $quantidadeOleo;

                        // ✅ Cria uma compensação "PRODUTO" (id_tipo = 3)
                        //    Isso é o que o seu modal espera para remontar o tipo produto ao editar.
                        ColetaCompensacao::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_tipo'        => 3, // PRODUTO
                            'quantidade'     => $quantidadeOleo,
                            'valor_unitario' => 0,
                            'observacao'     => $tipo['observacao'] ?? null,
                            'data_registro'  => now(),
                        ]);
                    }

                    // ✅ Cria os itens de produto vinculados
                    foreach ($produtos as $p) {
                        $qtdProduto = (float) ($p['quantidade'] ?? 0);
                        if ($qtdProduto <= 0) {
                            continue;
                        }

                        ColetaProduto::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_produto'     => $p['id_produto'],
                            'quantidade'     => $qtdProduto,
                            'valor_unitario' => 0,
                            'data_registro'  => now(),
                            // ❗ valor_total é calculado no banco (coluna gerada / trigger)
                        ]);
                    }
                }
            }

            // ✅ Atualiza quantidade_total com base nos litros compensados
            $coleta->update([
                'quantidade_total' => $totalLitros,
                'data_atualizacao' => now(),
            ]);

            // ✅ Retorna coleta já com todos os relacionamentos
            return response()->json([
                'status'  => 'success',
                'message' => 'Coleta criada com sucesso.',
                'data'    => $coleta->load([
                    'cliente',
                    'usuario',
                    'compensacoes.tipo',
                    'produtos.produto',
                ]),
            ], 201);
        });
    }


public function show($id)
{
    $coleta = Coleta::with([
        'cliente',
        'usuario',
        'compensacoes.tipo',
        'produtos.produto',
    ])->find($id);

    if (!$coleta) {
        return response()->json([
            'status'  => 'error',
            'message' => 'Coleta não encontrada.',
        ], 404);
    }

    return response()->json([
        'status' => 'success',
        'data'   => $coleta,
    ], 200);
}


    /**
     * ATUALIZAR COLETA
     */
    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {

            $coleta  = Coleta::findOrFail($id);
            $usuario = auth()->user();

            if (!$usuario) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Usuário não autenticado.',
                ], 401);
            }

            DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);

            $request->validate([
                'id_cliente'  => 'required|integer',
                'data_coleta' => 'required|date',
                'status'      => 'required|string',
                'observacao'  => 'nullable|string',
                'tipos'       => 'nullable|array',
            ]);

            // ✅ Atualiza dados principais
            $coleta->update([
                'id_cliente'       => $request->id_cliente,
                'id_usuario'       => $usuario->id_usuario,
                'data_coleta'      => $request->data_coleta,
                'status'           => $request->status,
                'observacao'       => $request->observacao,
                'data_atualizacao' => now(),
            ]);

            // ✅ Remove compensações e produtos antigos
            ColetaCompensacao::where('id_coleta', $coleta->id_coleta)->delete();
            ColetaProduto::where('id_coleta', $coleta->id_coleta)->delete();

            $totalLitros = 0;

            // ✅ Recria os tipos
            foreach ($request->tipos ?? [] as $tipo) {

                // PIX / CRÉDITO
                if ($tipo['tipo'] === 'pix' || $tipo['tipo'] === 'credito') {

                    $quantidade = (float) ($tipo['quantidade'] ?? 0);
                    $valorUnit  = (float) ($tipo['valor_unitario'] ?? 0);

                    if ($quantidade > 0) {
                        $totalLitros += $quantidade;

                        ColetaCompensacao::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_tipo'        => $tipo['tipo'] === 'pix' ? 1 : 2,
                            'quantidade'     => $quantidade,
                            'valor_unitario' => $valorUnit,
                            'observacao'     => $tipo['observacao'] ?? null,
                            'data_registro'  => now(),
                        ]);
                    }
                }

                // PRODUTO
                if ($tipo['tipo'] === 'produto') {

                    $quantidadeOleo = (float) ($tipo['quantidade_oleo'] ?? 0);
                    $produtos       = $tipo['produtos'] ?? [];

                    if ($quantidadeOleo > 0) {
                        $totalLitros += $quantidadeOleo;

                        ColetaCompensacao::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_tipo'        => 3, // PRODUTO
                            'quantidade'     => $quantidadeOleo,
                            'valor_unitario' => 0,
                            'observacao'     => $tipo['observacao'] ?? null,
                            'data_registro'  => now(),
                        ]);
                    }

                    foreach ($produtos as $p) {
                        $qtdProduto = (float) ($p['quantidade'] ?? 0);
                        if ($qtdProduto <= 0) {
                            continue;
                        }

                        ColetaProduto::create([
                            'id_coleta'      => $coleta->id_coleta,
                            'id_produto'     => $p['id_produto'],
                            'quantidade'     => $qtdProduto,
                            'valor_unitario' => 0,
                            'data_registro'  => now(),
                        ]);
                    }
                }
            }

            // ✅ Atualiza total de litros
            $coleta->update([
                'quantidade_total' => $totalLitros,
                'data_atualizacao' => now(),
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Coleta atualizada com sucesso.',
                'data'    => $coleta->load([
                    'cliente',
                    'usuario',
                    'compensacoes.tipo',
                    'produtos.produto',
                ]),
            ], 200);
        });
    }

    /**
     * DELETAR COLETA
     */
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {

            $usuario = auth()->user();
            if ($usuario) {
                DB::statement('SET @current_user_id = ?', [$usuario->id_usuario]);
            }

            $coleta = Coleta::findOrFail($id);

            ColetaCompensacao::where('id_coleta', $coleta->id_coleta)->delete();
            ColetaProduto::where('id_coleta', $coleta->id_coleta)->delete();

            $coleta->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Coleta removida com sucesso.',
            ], 200);
        });
    }
}
