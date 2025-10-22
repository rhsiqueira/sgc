<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permissao extends Model
{
    protected $table = 'permissao';
    protected $primaryKey = 'id_permissao';
    public $timestamps = false;

    protected $fillable = [
        'nome_modulo',
        'acao',
        'descricao',
        'data_criacao',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
    ];

    public function perfis()
    {
        return $this->belongsToMany(Perfil::class, 'perfil_permissao', 'id_permissao', 'id_perfil');
    }
}
