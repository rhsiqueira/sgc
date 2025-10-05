<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoCompensacao extends Model
{
    protected $table = 'tipo_compensacao';
    protected $primaryKey = 'id_tipo';
    public $timestamps = false;

    protected $fillable = [
        'nome_compensacao',
        'descricao',
        'data_criacao',
    ];

    protected $casts = [
        'data_criacao' => 'datetime',
    ];

    public function compensacoes()
    {
        return $this->hasMany(ColetaCompensacao::class, 'id_tipo', 'id_tipo');
    }
}