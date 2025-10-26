<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Adiciona o campo de controle de troca de senha
     */
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->boolean('password_reset_required')
                  ->default(false)
                  ->after('tentativas_login');
        });
    }

    /**
     * Remove o campo (rollback)
     */
    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn('password_reset_required');
        });
    }
};
