<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
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
    RelatorioController,
    HomeController
};

Route::get('/health', function () {
    return response()->json([
        'status'    => 'API SGC rodando com sucesso 🚀',
        'timestamp' => now(),
    ]);
});

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::middleware('auth:sanctum')->get('/home', [HomeController::class, 'index']);
    
    Route::patch('/usuarios/{id}/status', [UsuarioController::class, 'atualizarStatus']);
    Route::patch('/usuarios/{id}/redefinir-senha', [UsuarioController::class, 'redefinirSenha']);
    Route::apiResource('usuarios', UsuarioController::class);

    Route::apiResource('clientes', ClienteController::class);
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
});
