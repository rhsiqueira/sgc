<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    protected $table = 'perfil';
    protected $primaryKey = 'id_perfil';
    public $timestamps = false;

    protected $fillable = [
        'nome_perfil',
        'descricao',
        'data_criacao',
        'status',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuario::class, 'id_perfil', 'id_perfil');
    }

    public function permissoes()
    {
    return $this->belongsToMany(Permissao::class, 'perfil_permissao', 'id_perfil', 'id_permissao');
    }

}