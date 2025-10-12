<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * 🌍 Middleware global (roda em todas as requisições HTTP)
     * 
     * Exemplo: manutenção, tamanho de POST, sanitização etc.
     */
    protected $middleware = [
        // Verifica se a aplicação está em modo de manutenção
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,

        // Limita o tamanho máximo de payloads em requisições
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,

        // Remove espaços em branco de strings automaticamente
        \App\Http\Middleware\TrimStrings::class,

        // Converte valores vazios para null
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * 🧱 Middleware de grupos de rotas.
     * 
     * O Laravel separa por grupo `web` (para sites com sessões e CSRF)
     * e `api` (para APIs REST, como seu projeto SGC).
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // 🚦 Limita requisições para evitar abuso (60 requisições por minuto)
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',

            // Faz o bind automático de parâmetros nas rotas
            \Illuminate\Routing\Middleware\SubstituteBindings::class,

            // 🔒 Middleware customizado para definir o @current_user_id no MySQL
            // (roda em toda rota de API protegida)
            \App\Http\Middleware\SetCurrentUserId::class,
        ],
    ];

    /**
     * 🚦 Middleware individuais (podem ser aplicados manualmente nas rotas)
     * 
     * Aqui ficam os "apelidos" que você usa nas rotas:
     *   ->middleware('auth:sanctum')
     *   ->middleware('perfil:1,2')
     *   ->middleware('set.current.user')
     */
    protected $routeMiddleware = [
        // 🔐 Autenticação padrão Laravel
        'auth' => \App\Http\Middleware\Authenticate::class,

        // 🚫 Redireciona usuários já logados (em rotas públicas)
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,

        // 🚦 Controle de tráfego
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,

        // 📎 Validação de parâmetros de rota
        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,

        // ✅ Seus middlewares customizados
        // Define @current_user_id com base no token autenticado
        'set.current.user' => \App\Http\Middleware\SetCurrentUserId::class,

        // Restringe acesso a perfis específicos (ex: perfil:1,2)
        'perfil' => \App\Http\Middleware\EnsurePerfil::class,
    ];
}
