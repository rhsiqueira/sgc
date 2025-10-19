<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains (apenas para SPA via cookie)
    |--------------------------------------------------------------------------
    |
    | Se você autenticar uma SPA (cookies), liste aqui os domínios/clientes.
    | Para autenticação por Bearer token (Postman), esse bloco não interfere.
    |
    */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards (apenas para SPA via cookie)
    |--------------------------------------------------------------------------
    |
    | Quais guards o Sanctum tentará autenticar via sessão.
    | Para Bearer token, Sanctum autentica pelo token direto (ignora isso).
    | Deixar ['web'] é o padrão recomendado.
    |
    */
    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Token Expiration (Bearer tokens)
    |--------------------------------------------------------------------------
    |
    | null = sem expiração automática. Você pode expirar manualmente.
    |
    */
    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    |
    | Útil para detecção de segredos em repositórios públicos.
    |
    */
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Middleware usados no fluxo de SPA stateful
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
