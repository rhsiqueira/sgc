<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = 'usuario';
    protected $primaryKey = 'id_usuario';
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

    // Relacionamentos
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