<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimentacaoEstoque extends Model
{
    protected $table = 'movimentacao_estoque';
    protected $primaryKey = 'id_movimentacao';
    public $timestamps = false;

    protected $fillable = [
        'id_produto',
        'tipo',
        'quantidade',
        'origem',
        'id_coleta',
        'observacao',
        'data_movimentacao',
    ];

    protected $casts = [
        'quantidade'        => 'decimal:2',
        'data_movimentacao' => 'datetime',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'id_produto', 'id_produto');
    }

    public function coleta()
    {
        return $this->belongsTo(Coleta::class, 'id_coleta', 'id_coleta');
    }
}