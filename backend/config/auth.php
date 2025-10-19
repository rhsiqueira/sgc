<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | Guard padrão: usamos 'api' (Sanctum) pois a aplicação é uma API.
    | Broker de reset: apontamos para 'usuarios' (provider abaixo).
    |
    */
    'defaults' => [
        'guard' => env('AUTH_GUARD', 'api'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'usuarios'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards
    |--------------------------------------------------------------------------
    |
    | 'web' (session) é útil pra SPA stateful; 'api' usa Sanctum (Bearer token).
    | Ambos usam o provider 'usuarios' (model App\Models\Usuario).
    |
    */
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'usuarios',
        ],

        'api' => [
            'driver' => 'sanctum',
            'provider' => 'usuarios',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers
    |--------------------------------------------------------------------------
    |
    | Diz ao Laravel de onde carregar o "usuário autenticável".
    | Importante: apontar para App\Models\Usuario (sua tabela 'usuario').
    |
    */
    'providers' => [
        'usuarios' => [
            'driver' => 'eloquent',
            'model' => App\Models\Usuario::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Reset de Senha
    |--------------------------------------------------------------------------
    |
    | Mantemos a tabela padrão 'password_reset_tokens'.
    |
    */
    'passwords' => [
        'usuarios' => [
            'provider' => 'usuarios',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    */
    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
