<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

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
        'tentativas_login',
        'data_criacao',
        'data_atualizacao',
        'password_reset_required', // ✅ novo campo adicionado
    ];

    protected $hidden = [
        'senha_hash',
    ];

    protected $casts = [
        'data_criacao'             => 'datetime',
        'data_atualizacao'         => 'datetime',
        'password_reset_required'  => 'boolean', // ✅ conversão automática para boolean
    ];

    /**
     * ⚙️ Define o campo usado para autenticação (senha)
     */
    public function getAuthPassword()
    {
        return $this->senha_hash;
    }

    /**
     * 🔹 Força o Eloquent a não enviar id_usuario manualmente
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($usuario) {
            // Evita que o Eloquent envie id_usuario = null
            unset($usuario->id_usuario);
        });
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
