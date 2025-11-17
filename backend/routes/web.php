<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['status' => 'ok']);
});

// Blindagem: rota "login" nomeada, evita RouteNotFoundException em fluxos web.
Route::get('/login', function () {
    return response()->json([
        'status'  => 'error',
        'message' => 'Faça login pela aplicação (SPA) ou use /api/auth/login.'
    ], 401);
})->name('login');
