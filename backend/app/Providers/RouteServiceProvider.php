<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Define o ponto de entrada das rotas do projeto.
     */
    public function boot(): void
    {
        $this->routes(function () {
            // ✅ Rotas da API
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // ✅ Rotas Web (caso existam futuramente)
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
