<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PedidoCompra extends Model
{
    protected $table = 'pedido_compra';
    protected $primaryKey = 'id_pedido';
    public $timestamps = false;

    protected $fillable = [
        'id_produto',
        'quantidade_solicitada',
        'status',
        'data_solicitacao',
        'data_atualizacao',
        'observacao',
    ];

    protected $casts = [
        'quantidade_solicitada' => 'decimal:2',
        'data_solicitacao'      => 'datetime',
        'data_atualizacao'      => 'datetime',
    ];

    public function produto()
    {
        return $this->belongsTo(Produto::class, 'id_produto', 'id_produto');
    }
}