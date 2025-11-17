<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\{
    ClienteController,
    UsuarioController,
    PerfilController,
    PermissaoController,
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

/*
|--------------------------------------------------------------------------
| 🌡 Health Check
|--------------------------------------------------------------------------
| Endpoint simples pra confirmar que a API está viva.
*/
Route::get('/health', function () {
    return response()->json([
        'status'    => 'API SGC rodando com sucesso 🚀',
        'timestamp' => now(),
    ]);
});

/*
|--------------------------------------------------------------------------
| 🔓 Rotas Públicas (sem autenticação)
|--------------------------------------------------------------------------
*/
Route::post('/auth/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| 🔐 Rotas Protegidas (Autenticadas)
|--------------------------------------------------------------------------
| Tudo aqui exige token válido (Sanctum).
| O middleware "perfil" é aplicado conforme o módulo/ação.
*/
Route::middleware(['auth:sanctum'])->group(function () {

    // ===== Autenticação =====
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // ===== Página inicial =====
    Route::get('/home', [HomeController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | 👤 Usuários
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:USUARIO,C')->get('/usuarios', [UsuarioController::class, 'index']);
    Route::middleware('perfil:USUARIO,C')->get('/usuarios/{id}', [UsuarioController::class, 'show']);
    Route::middleware('perfil:USUARIO,I')->post('/usuarios', [UsuarioController::class, 'store']);
    Route::middleware('perfil:USUARIO,A')->put('/usuarios/{id}', [UsuarioController::class, 'update']);
    Route::middleware('perfil:USUARIO,E')->delete('/usuarios/{id}', [UsuarioController::class, 'destroy']);
    Route::middleware('perfil:USUARIO,A')->patch('/usuarios/{id}/status', [UsuarioController::class, 'atualizarStatus']);
    Route::middleware('perfil:USUARIO,A')->patch('/usuarios/{id}/redefinir-senha', [UsuarioController::class, 'redefinirSenha']);

    /*
    |--------------------------------------------------------------------------
    | 🧾 Clientes
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:CLIENTE,C')->get('/clientes', [ClienteController::class, 'index']);
    Route::middleware('perfil:CLIENTE,C')->get('/clientes/{id}', [ClienteController::class, 'show']);
    Route::middleware('perfil:CLIENTE,I')->post('/clientes', [ClienteController::class, 'store']);
    Route::middleware('perfil:CLIENTE,A')->put('/clientes/{id}', [ClienteController::class, 'update']);
    Route::middleware('perfil:CLIENTE,E')->delete('/clientes/{id}', [ClienteController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | 🧠 Perfis e Permissões
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:PERFIL,C')->get('/perfis', [PerfilController::class, 'index']);
    Route::middleware('perfil:PERFIL,C')->get('/perfis/{id}', [PerfilController::class, 'show']);
    Route::middleware('perfil:PERFIL,I')->post('/perfis', [PerfilController::class, 'store']);
    Route::middleware('perfil:PERFIL,A')->put('/perfis/{id}', [PerfilController::class, 'update']);
    Route::middleware('perfil:PERFIL,E')->delete('/perfis/{id}', [PerfilController::class, 'destroy']);

    Route::middleware('perfil:PERMISSAO,C')->get('/permissoes', [PermissaoController::class, 'index']);
    Route::middleware('perfil:PERMISSAO,C')->get('/permissoes/{id}', [PermissaoController::class, 'show']);

    /*
    |--------------------------------------------------------------------------
    | 📦 Produtos
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:PRODUTO,C')->get('/produtos', [ProdutoController::class, 'index']);
    Route::middleware('perfil:PRODUTO,I')->post('/produtos', [ProdutoController::class, 'store']);
    Route::middleware('perfil:PRODUTO,A')->put('/produtos/{id}', [ProdutoController::class, 'update']);
    Route::middleware('perfil:PRODUTO,E')->delete('/produtos/{id}', [ProdutoController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | ⚖️ Tipos de Compensação
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:TIPO_COMPENSACAO,C')->get('/tipos-compensacao', [TipoCompensacaoController::class, 'index']);
    Route::middleware('perfil:TIPO_COMPENSACAO,I')->post('/tipos-compensacao', [TipoCompensacaoController::class, 'store']);
    Route::middleware('perfil:TIPO_COMPENSACAO,A')->put('/tipos-compensacao/{id}', [TipoCompensacaoController::class, 'update']);
    Route::middleware('perfil:TIPO_COMPENSACAO,E')->delete('/tipos-compensacao/{id}', [TipoCompensacaoController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | 🚛 Coletas
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:COLETA,C')->apiResource('coletas', ColetaController::class);
    Route::middleware('perfil:COLETA_COMPENSACAO,C')->apiResource('coletas-compensacoes', ColetaCompensacaoController::class);
    Route::middleware('perfil:COLETA_PRODUTO,C')->apiResource('coletas-produtos', ColetaProdutoController::class);

    /*
    |--------------------------------------------------------------------------
    | 🏗️ Movimentação de Estoque
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:MOVIMENTACAO_ESTOQUE,C')->apiResource('movimentacoes-estoque', MovimentacaoEstoqueController::class);

    /*
    |--------------------------------------------------------------------------
    | 📜 Contratos e Pedidos
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:PEDIDO_COMPRA,C')->apiResource('pedidos-compra', PedidoCompraController::class);
    Route::middleware('perfil:CONTRATO,C')->apiResource('contratos', ContratoController::class);
    Route::middleware('perfil:CONTRATO,C')->get('/clientes/{idCliente}/contratos', [ContratoController::class, 'listarPorCliente'])
        ->name('clientes.contratos');

    /*
    |--------------------------------------------------------------------------
    | 🧾 Logs e Relatórios
    |--------------------------------------------------------------------------
    */
    Route::middleware('perfil:LOG_AUDITORIA,C')->apiResource('logs-auditoria', LogAuditoriaController::class);
    Route::middleware('perfil:RELATORIO,C')->apiResource('relatorios', RelatorioController::class);
});

