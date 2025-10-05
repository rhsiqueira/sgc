<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\{
    ClienteController,
    UsuarioController,
    PerfilController,
    ProdutoController,
    TipoCompensacaoController,
    ColetaController,
    ColetaCompensacaoController,
    ColetaProdutoController,
    MovimentacaoEstoqueController,
    PedidoCompraController,
    ContratoController,
    LogAuditoriaController,
    RelatorioController
};

Route::apiResource('clientes', ClienteController::class);
Route::apiResource('usuarios', UsuarioController::class);
Route::apiResource('perfis', PerfilController::class);
Route::apiResource('produtos', ProdutoController::class);
Route::apiResource('movimentacoes-estoque', MovimentacaoEstoqueController::class);
Route::apiResource('pedidos-compra', PedidoCompraController::class);
Route::apiResource('coletas', ColetaController::class);
Route::apiResource('coletas-compensacoes', ColetaCompensacaoController::class);
Route::apiResource('coletas-produtos', ColetaProdutoController::class);
Route::apiResource('tipos-compensacao', TipoCompensacaoController::class);
Route::apiResource('contratos', ContratoController::class);
Route::apiResource('logs-auditoria', LogAuditoriaController::class);
Route::apiResource('relatorios', RelatorioController::class);

Route::get('/health', function () {
    return response()->json([
        'status' => 'API SGC rodando com sucesso 🚀',
        'timestamp' => now()
    ]);
});