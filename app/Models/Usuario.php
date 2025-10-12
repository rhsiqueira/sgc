<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable; // Base para autenticação
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuario'; 
    protected $primaryKey = 'id_usuario'; 
    public $incrementing = true; 
    protected $keyType = 'int';  
    public $timestamps = false;  

    protected $fillable = [
        'nome_completo',
        'email',
        'cpf',
        'senha_hash',
        'id_perfil',
        'status',
        'data_criacao',
        'data_atualizacao',
    ];

    protected $casts = [
        'data_criacao'     => 'datetime',
        'data_atualizacao' => 'datetime',
    ];

    protected $hidden = [
        'senha_hash', // 🔒 Esconde a senha nas respostas JSON
    ];

    /**
     * ⚙️ Define qual campo o Laravel deve usar como senha na autenticação.
     */
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }

    // 🔹 Relacionamentos
    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'id_perfil', 'id_perfil');
    }

    public function coletas()
    {
        return $this->hasMany(Coleta::class, 'id_usuario', 'id_usuario');
    }

    public function logs()
    {
        return $this->hasMany(LogAuditoria::class, 'id_usuario', 'id_usuario');
    }
}
